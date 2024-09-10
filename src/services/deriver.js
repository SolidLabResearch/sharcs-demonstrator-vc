import express from 'express'
import bodyParser from 'body-parser'
import config from "../config/config.js";
import {Deriver} from "../controllers/deriver.js";
import {RegistryWebserviceProxy} from "../proxies/RegistryWebserviceProxy.js";
import cors from 'cors'
const serviceConfig = config.derive
const app = express()
const port = serviceConfig.port
app.use(cors())
app.use(bodyParser.json({limit: '50mb'}));
app.use((req,res,next) =>{
  console.log(`[⎔\t${serviceConfig.name}]`, req.method, req.path,);
  next();
});

const deriver = new Deriver(
    new RegistryWebserviceProxy(config.registry.baseUrl, config.registry.port)
)

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
  if (predicates) {
    // When predicates are present, we execute a range query proof
    derivedResult = await deriver.rq(vcPairs, predicates,challenge)
  } else {
    // Assuming selective-disclosure
    derivedResult = await deriver.sd(vcPairs, challenge)
  }
  // Return result
  if (derivedResult) {
    res.send(derivedResult)
  } else {
    res.sendStatus(400)
  }
})

app.listen(port, () => {
  console.log(`Service [Derive] listening on port ${port}`)
})

