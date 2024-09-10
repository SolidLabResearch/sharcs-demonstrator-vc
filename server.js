import express from 'express'
import bodyParser from 'body-parser'
import {
    BbsBlsSignatureProof2020,
    deriveProof,
} from "@mattrglobal/jsonld-signatures-bbs";
import config from "./src/config/config.js";
import { documentLoader, readJsonFile } from './util';
import swaggerUi from "swagger-ui-express";
import swaggerSpec from './src/config/swaggerConfig.js'
import cors from 'cors'
import path from 'path'
const app = express()
const port = config.gateway.port;
app.use(cors())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use(bodyParser.json({ limit: '50mb' }));

const schemeMapConfig = {
    'diploma-minimal': {
        disclosedDoc: path.resolve(__dirname, './data/frame/frame_leercredential_diplomaniveau.json')
    }
}
const schemeMap = Object.fromEntries(
    Object.entries(schemeMapConfig)
        .map(([k, v]) => [k, { disclosed: readJsonFile(v.disclosedDoc) }])
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
 *           schema:
 *             type: object
 *             properties:
 *               options:
 *                  type: object
 *                  properties:
 *                      scheme:
 *                          type: string
 *                          example: "diploma-minimal"
 *               verifiableCredential:
 *                 type: object
 *                 description: A verifiable credential in JSON-LD format.
 *     responses:
 *       200:
 *         description: Derived Verifiable Credential
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
    const { verifiableCredential, options } = req.body;
    if (!options) {
        res.status(400).send('No options found!')
        return
    }
    if (!options.scheme) {
        res.status(400).send('No options.scheme found!')
        return
    }
    console.log({ verifiableCredential, options });

    if (!Object.keys(schemeMap).includes(options.scheme)) {
        res.status(400).send(`Scheme ${options.scheme} not found!`)
    }

    const derivedDocument = await deriveProof(verifiableCredential, schemeMap[options.scheme].disclosed, {
        suite: new BbsBlsSignatureProof2020(),
        documentLoader,
    });

    res.send(derivedDocument);
    return;
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

// below all route handlers
// If all fails, hit em with the 404
app.all('*', function (req, res) {
    res.status(404).send('Route not found!')
});

app.listen(port, () => {
    console.log(`Service [Gateway] listening on port ${port}`)
})

