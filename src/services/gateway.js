import express from 'express'
import bodyParser from 'body-parser'
import config, {urlDerive} from "../config/config.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from '../config/swaggerConfig.js'
import {_frame, logv2, readJsonFile} from "../utils.js";

const app = express()
const port = config.gateway.port;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use(bodyParser.json({limit: '50mb'}));

const schemeMap = {
    'diploma-minimal': {
        disclosedDoc: '__tests__/__fixtures__/selective-disclosure/vc1-sd-001c.json'
    }
}

/**
 * // TODO: add verifiableCredential schema
 * @swagger
 *
 * /credentials/derive:
 *   post:
 *     tags:
 *        - Main
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         description:
 *         required: true
 *         schema:
 *            type: "object"
 *            properties:
 *               verifiableCredential:
 *                  type: object
 *               scheme:
 *                  type: "string"
 *                  example: "diploma-minimal"
 *     responses:
 *         '200':
 *           description: OK
 *         '400':
 *           description: Bad request.
 *         '5XX':
 *           description: Unexpected error.
 *
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
        readJsonFile(schemeMap[scheme].disclosedDoc)
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
    if(deriveResponse.ok) {
        res.send(await deriveResponse.json())
    } else {
        res.sendStatus(500) // TODO: check appropriate status to return
    }
})


/**
 * @swagger
 *
 * /schemes:
 *   get:
 *     tags:
 *      - Other
 *     produces:
 *       - application/json
 *     responses:
 *         200:
 *           description: List of available minimization schemes
 *           schema:
 *             type: array
 *             items:
 *              type: string

 */
app.get('/schemes', async (req, res) => {
    console.log('[gateway]/schemes')
    res.send(Object.keys(schemeMap))
})

app.listen(port, () => {
    console.log(`Service [Gateway] listening on port ${port}`)
})

