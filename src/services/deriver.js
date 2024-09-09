import express from 'express'
import bodyParser from 'body-parser'
import config from "../config/config.js";
import {Deriver} from "../controllers/deriver.js";
import {RegistryWebserviceProxy} from "../proxies/RegistryWebserviceProxy.js";

const app = express()
const port = config.derive.port;

app.use(bodyParser.json({limit: '50mb'}));

const deriver = new Deriver(
    new RegistryWebserviceProxy(config.registry.baseUrl, config.registry.port)
)

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

