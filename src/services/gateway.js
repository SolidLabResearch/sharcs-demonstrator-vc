import express from 'express'
import bodyParser from 'body-parser'
import config from "../config/config.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from '../config/swaggerConfig.js'

const app = express()
const port = config.gateway.port;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use(bodyParser.json({limit: '50mb'}));

/**
 * // TODO: add verifiableCredential schema
 * @swagger
 *
 * /credentials/derive:
 *   post:
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
 *
 */
app.post('/credentials/derive', async (req, res) => {
    console.log('[gateway]/credentials/derive')
    const {verifiableCredential, scheme} = req.body;
    console.log({ verifiableCredential, scheme });
    res.sendStatus(500)
})

/**
 * @swagger
 *
 * /schemes:
 *   get:
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
    const schemes = ['diploma-minimal']
    res.send(schemes)
})

app.listen(port, () => {
    console.log(`Service [Gateway] listening on port ${port}`)
})

