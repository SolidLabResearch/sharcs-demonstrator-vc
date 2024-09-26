import express from 'express'
import bodyParser from 'body-parser'
import config, {urlDerive} from "../config/config.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from '../config/swaggerConfig.js'
import {
  _frame,
  getNestedAttribute,
  logv2,
  matchVariableAssignments,
  readJsonFile,
  setNestedAttribute
} from "../utils.js";
import cors from 'cors'
import {documentLoaderAll, documentLoaderAthumi} from "../documentloader.js";
import {executeDeriveRequest, preprocessContext} from "../../__tests__/helpers.js";
import {CONTEXTS_ATHUMI} from "../resources/contexts/index.js";

const serviceConfig = config.gateway
const app = express()
const port = serviceConfig.port;
app.use(cors())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use(bodyParser.json({limit: '50mb'}));

if (serviceConfig.logging.enabled) {
  app.use((req, res, next) => {
    console.log(`[⎔\t${serviceConfig.name}] - method: ${req.method} - path: ${req.path}`);
    if (serviceConfig.logging.body)
      logv2({body: req.body})
    next();
  });
}

const schemeMapConfig = {
  'diploma-minimal': {
    disclosedDoc: '__tests__/__fixtures__/selective-disclosure/athumi/frame_leercredential_diplomaniveau-v2.json'
  },
  'diploma-rq-toekenningsdatum-after-2000-01-01': {
    disclosedDoc: '__tests__/__fixtures__/range-query/athumi/frame-rq-toekenningsdatum.json',
    predicates: [
      {
        '@context': 'https://zkp-ld.org/context.jsonld',
        type: 'Predicate',
        circuit: 'circ:lessThanPubPrv',
        private: [
          {
            type: 'PrivateVariable',
            var: 'greater',
            val: '_:Y',
          },
        ],
        public: [
          {
            type: 'PublicVariable',
            var: 'lesser',
            val: {
              '@value': '2000-01-01T00:00:00.000Z',
              '@type': 'xsd:dateTime',
            },
          },
        ],
      },
    ]
  },
  'diploma-minimal-example': {
    disclosedDoc: '__tests__/__fixtures__/selective-disclosure/vc1-sd-001c.json'
  },
  'identity-minimal-example': {
    disclosedDoc: '__tests__/__fixtures__/selective-disclosure/vc2-sd-001b.json'
  }
}
const schemeMap = Object.fromEntries(
  Object.entries(schemeMapConfig)
    .map(([k, v]) => [
        k,
        {
          disclosed: readJsonFile(v.disclosedDoc),
          predicates: v.predicates
        }
      ]
    )
)

/**
 * @swagger
 * /credentials/derive:
 *   post:
 *     summary: Allows for applying selective disclosure (SD) and range query (RQ) proofs on Verifiable Credentials (VCs).
 *     description: Takes a Verifiable Credential and minimization scheme as input and results in a Verifiable Presentation
 *      (VP) containing the derived credential.
 *      The current examples allow you to apply two different minimization schemes
 *      on different diploma credentials. More specifically, scheme "diploma-minimal" selectively discloses a subset of
 *      the diploma credential's attributes,
 *      while "diploma-rq-toekenningsdatum-after-2000-01-01" creates a range query proof allowing the holder to prove
 *      that the diploma credential's rewarding date is post 01/01/2000.
 *     tags:
 *       - Gateway service
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           examples:
 *               Bachelor of Science Biologie:
 *                 $ref: '#/components/examples/bachelorofscience_biologie'
 *               Bachelor of Science Biologie Range Query (Toekenningsdatum na 2020):
 *                 $ref: '#/components/examples/bachelorofscience_biologie_rq_01'
 *               Getuigschrift Latijn eerste graad:
 *                 $ref: '#/components/examples/getuigschrift_latijn-eerstegraad'
 *               Getuigschrift Latijn eerste graad (Toekenningsdatum na 2020):
 *                 $ref: '#/components/examples/getuigschrift_latijn-eerstegraad_rq_01'
 *               Licenciaat Sociologie:
 *                 $ref: '#/components/examples/licentiaat_sociologie'
 *               Licenciaat Sociologie (Toekenningsdatum na 2020):
 *                 $ref: '#/components/examples/licentiaat_sociologie_rq_01'
 *               Opticien:
 *                 $ref: '#/components/examples/opticien-beroepskennis'
 *               Opticien (Toekenningsdatum na 2020):
 *                 $ref: '#/components/examples/opticien-beroepskennis_rq_01'
 *               Master of Science Biologie:
 *                  $ref: '#/components/examples/masterofscience-biologie'
 *               Master of Science Biologie (Toekenningsdatum na 2020):
 *                  $ref: '#/components/examples/masterofscience-biologie_rq_01'
 *           schema:
 *             type: object
 *             properties:
 *               options:
 *                  type: object
 *                  properties:
 *                      method:
 *                          type: string
 *                          example: "diploma-minimal"
 *               verifiableCredential:
 *                 type: object
 *                 description: A verifiable credential in JSON-LD or JWT format.
 *     responses:
 *       200:
 *         description: Verifiable Presentation with derived credential
 *
 *       400:
 *         description: Bad request or invalid credential.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid credential format or missing parameters."
 *       500:
 *         description: Internal server error.
 */
app.post('/credentials/derive', async (req, res) => {
  const {verifiableCredential, options } = req.body;

  if (!!!options)
    res.sendStatus(400) // Bad Request

  const { scheme } = options;
  if (!Object.keys(schemeMap).includes(scheme)) {
    console.error(`scheme: ${scheme} does not exist!`)
    res.sendStatus(400) // Bad Request
  }
  const challenge = 'abc123' // TODO
  let {disclosed, predicates} = schemeMap[scheme];

  if(disclosed['@context'].includes('https://solid.data.vlaanderen.be/doc/implementatiemodel/leercredential/2023-02-01/context/leercredential-ap.jsonld'))
    disclosed = preprocessContext(disclosed)

  let newFrame = await _frame(verifiableCredential, disclosed, documentLoaderAll)

  if(!!predicates) {
    // RQ
    // Find & Match variable assignments
    const matchedVariableAssignments = matchVariableAssignments(disclosed)
    // Process matched var assignments
    const [ma,] = matchedVariableAssignments // TODO: iteratively process all matched var assignments (currently only 1st)
    const updatePath = ma.pathElements.slice(0, -1)
    setNestedAttribute(newFrame, updatePath, getNestedAttribute(disclosed, updatePath))
  }
  // Backend call (/derive)
  const deriveResponse = await executeDeriveRequest(
    [{original: verifiableCredential, disclosed: newFrame, predicates }],
    predicates,
    challenge
  )
  if(!deriveResponse.ok) {
    console.error('Error @ backend. Derive response NOT ok!')
    res.send(500)
  } else {
    const derivedResult = await deriveResponse.json()
    res.send(derivedResult)
  }
})

/**
 * @swagger
 *
 * /schemes:
 *   get:
 *     tags:
 *      - Gateway service
 *     produces:
 *       - application/json
 *     responses:
 *         200:
 *           description: Available minimization schemes
 *           schema:
 *             type: object
 */
app.get('/schemes', async (req, res) => {
  res.send(schemeMap)
})

app.listen(port, () => {
  console.log(`Service [${serviceConfig.name}] listening on port ${port}`)
})

