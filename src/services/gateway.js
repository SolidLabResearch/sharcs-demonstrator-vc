import express from 'express'
import bodyParser from 'body-parser'
import config, {urlDerive} from "../config/config.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from '../config/swaggerConfig.js'
import {_frame, logv2, readJsonFile} from "../utils.js";
import cors from 'cors'
import {documentLoaderAll, documentLoaderAthumi} from "../documentloader.js";
const app = express()
const port = config.gateway.port;
app.use(cors())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use(bodyParser.json({limit: '50mb'}));

const schemeMapConfig = {
    'diploma-minimal': {
        disclosedDoc: '__tests__/__fixtures__/selective-disclosure/athumi/frame_leercredential_diplomaniveau-v2.json'
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
        .map(([k,v])=>[k, {disclosed: readJsonFile(v.disclosedDoc)}])
)

/**
 * @swagger
 * /credentials/derive:
 *   post:
 *     summary: Derives a Verifiable Credential
 *     description: Takes a Verifiable Credential as input and derives a new credential based on a minimization scheme.
 *     tags:
 *       - Gateway service
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           examples:
 *               Bachelor of Science Biologie:
 *                 $ref: '#/components/examples/bachelorofscience_biologie'
 *               Getuigschrift Latijn eerste graad:
 *                 $ref: '#/components/examples/getuigschrift_latijn-eerstegraad'
 *               Licenciaat Sociologie:
 *                 $ref: '#/components/examples/licentiaat_sociologie'
 *               Opticien:
 *                 $ref: '#/components/examples/opticien-beroepskennis'
 *               Master of Science Biologie:
 *                  $ref: '#/components/examples/masterofscience-biologie'
 *
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
    console.log('[gateway]/credentials/derive')
    const {verifiableCredential, scheme} = req.body;
    console.log({ verifiableCredential, scheme });

    if(!Object.keys(schemeMap).includes(scheme)) {
        res.sendStatus(400) // Bad Request
    }

    const disclosed = await _frame(
        verifiableCredential,
        schemeMap[scheme].disclosed,
        documentLoaderAll
    )
    // Backend: deriver
    // TODO: appropriate challenge generation & handling
    const challenge = 'abc123'
    const deriveResponse = await fetch(
        urlDerive,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                vcPairs: [
                    {
                        original: verifiableCredential,
                        disclosed,
                    }
                ],
                challenge
            })
        }
    )
    try {
        // console.log('deriveResponse.json()...') // TODO: delete
        const derivedResult = await deriveResponse.json()
        // logv2(derivedResult) // TODO: delete
        res.send(derivedResult)
    } catch (err) {
        console.error('ERROR WHILE PROCESSING DERIVE RESPONSE')
        res.sendStatus(500)
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
    console.log('[gateway]/schemes')
    // res.send(Object.keys(schemeMap))
    res.send(schemeMap)
})

app.listen(port, () => {
    console.log(`Service [Gateway] listening on port ${port}`)
})

