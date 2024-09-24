import express from 'express'
import bodyParser from 'body-parser'
import config from "../config/config.js";
import {Deriver} from "../controllers/deriver.js";
import {RegistryWebserviceProxy} from "../proxies/RegistryWebserviceProxy.js";
import cors from 'cors'
import {documentLoaderAll} from "../documentloader.js";
import {logv2} from "../utils.js";
import {preprocessVC} from "../../__tests__/helpers.js";
import {actors} from "../../__tests__/actors.js";

const deriver = new Deriver(
    new RegistryWebserviceProxy(config.registry.baseUrl, config.registry.port),
    documentLoaderAll
)
const serviceConfig = config.derive
const app = express()
const port = serviceConfig.port
app.use(cors())
app.use(bodyParser.json({limit: '50mb'}));

if (serviceConfig.logging.enabled) {
  app.use((req,res,next) =>{
    console.log(`[⎔\t${serviceConfig.name}] - method: ${req.method} - path: ${req.path}`);
    if(serviceConfig.logging.body)
      logv2({body: req.body})
    next();
  });
}

/**
 * @swagger
 * /derive:
 *   post:
 *     tags:
 *        - Deriver service
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: vcPairs
 *         in: body
 *         required: true
 *         type: array
 *         items:
 *          type: object
 */
app.post('/derive', async (req, res) => {
  let derivedResult = undefined
  const {vcPairs, predicates, challenge} = req.body

  try {
    if (predicates) {
      // When predicates are present, we execute a range query proof
      derivedResult = await deriver.rq(vcPairs, predicates,challenge)
    } else {
      // Assuming selective-disclosure
      derivedResult = await deriver.sd(vcPairs, challenge)
    }
    // Return result
    if (derivedResult)
      res.send(derivedResult)
    else
      res.sendStatus(400)

  } catch(error) {
    console.error(error)
    res.sendStatus(500)
  }
})

/**
 * @swagger
 * /sign:
 *   post:
 *     tags:
 *        - Deriver service
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: verifiableCredential
 *         in: body
 *         required: true
 *         type: object
 */
app.post('/sign', async (req, res) => {

  let {verifiableCredential} = req.body
  verifiableCredential = await preprocessVC(verifiableCredential)
  // TODO: !!! Signing currently fixed to issuer0 keypair
  const signedVc = await deriver.sign(verifiableCredential, [actors.issuer0])
  res.send(signedVc)
})

app.listen(port, () => {
  console.log(`Service [Derive] listening on port ${port}`)
})

