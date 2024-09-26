import express from 'express'
import bodyParser from 'body-parser'
import {Registry} from "../controllers/registry.js";
import config from '../config/config.js'
import {logv2} from "../utils.js";
import cors from 'cors'
import {actors} from "../../__tests__/actors.js";
const serviceConfig = config.registry
const app = express()

const port = serviceConfig.port
const registry = new Registry()
app.use(cors())
app.use(bodyParser.json())

if (serviceConfig.logging.enabled) {
    app.use((req,res,next) =>{
        console.log(`[⎔\t${serviceConfig.name}] - method: ${req.method} - path: ${req.path}`);
        if(serviceConfig.logging.body)
            logv2({body: req.body})
        next();
    });
}

if(serviceConfig.preloadExampleIdentities === true) {
    const { issuer0} = actors
    const exampleIdentities = {
        issuer0
    }
    Object.entries(exampleIdentities)
        .forEach(([key, value]) => {
            registry.register(value.id, value)
            console.log(`[⎔\t${serviceConfig.name}] - Pre-registered: ${value.id}`);
        })
}

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new DID Controller Document
 *     description: Takes a decentralized identifier (DID) and its associated DID Controller Document to register it on the system.
 *     tags:
 *       - Registry service
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - controllerDoc
 *             properties:
 *               id:
 *                 type: string
 *                 description: The decentralized identifier (DID) to be registered.
 *                 example: "did:example:123456789abcdefghi"
 *               controllerDoc:
 *                 type: object
 *                 description: The DID Controller Document associated with the DID.
 *                 properties:
 *                   "@context":
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["https://www.w3.org/ns/did/v1"]
 *                   id:
 *                     type: string
 *                     description: The decentralized identifier (DID).
 *                     example: "did:example:123456789abcdefghi"
 *                   controller:
 *                     type: string
 *                     description: The controller of the DID.
 *                     example: "did:example:controller"
 *                   verificationMethod:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: The ID of the verification method.
 *                           example: "did:example:123456789abcdefghi#keys-1"
 *                         type:
 *                           type: string
 *                           description: The type of verification method.
 *                           example: "Ed25519VerificationKey2018"
 *                         controller:
 *                           type: string
 *                           description: The DID controller for the key.
 *                           example: "did:example:123456789abcdefghi"
 *                         publicKeyBase58:
 *                           type: string
 *                           description: The public key in base58 format.
 *                           example: "H3C2AVvLMzNw2gP5BjhmB2zYbDVabLFgf2HG2k34MKVh"
 *                   authentication:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["did:example:123456789abcdefghi#keys-1"]
 *     responses:
 *       201:
 *         description: DID and Controller Document registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "DID and Controller Document registered successfully."
 *       400:
 *         description: Invalid input, missing required fields or invalid DID/Controller Document format.
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
 *                   example: "Invalid DID or Controller Document format."
 *       500:
 *         description: Internal server error during registration.
 */
app.post('/register', async (req, res) => {
    const {id, controllerDoc} = req.body
    try {
        registry.register(id, controllerDoc)
        res.send({ id })
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

/**
 * @swagger
 * /resolve:
 *   post:
 *     summary: Resolve a DID and retrieve its DID Controller Document
 *     description: Takes a decentralized identifier (DID) as input and returns the associated DID Controller Document.
 *     tags:
 *       - Registry service
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: An identifier to be resolved.
 *                 example: "urn:test:001"
 *     responses:
 *       200:
 *         description: Successfully retrieved the DID Controller Document.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 "@context":
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["https://www.w3.org/ns/did/v1"]
 *                 id:
 *                   type: string
 *                   description: The decentralized identifier (DID).
 *                   example: "did:example:123456789abcdefghi"
 *                 controller:
 *                   type: string
 *                   description: The controller of the DID.
 *                   example: "did:example:controller"
 *                 verificationMethod:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: The ID of the verification method.
 *                         example: "did:example:123456789abcdefghi#keys-1"
 *                       type:
 *                         type: string
 *                         description: The type of verification method.
 *                         example: "Ed25519VerificationKey2018"
 *                       controller:
 *                         type: string
 *                         description: The DID controller for the key.
 *                         example: "did:example:123456789abcdefghi"
 *                       publicKeyBase58:
 *                         type: string
 *                         description: The public key in base58 format.
 *                         example: "H3C2AVvLMzNw2gP5BjhmB2zYbDVabLFgf2HG2k34MKVh"
 *                 authentication:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["did:example:123456789abcdefghi#keys-1"]
 *       400:
 *         description: Invalid identifier format or missing parameter.
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
 *                   example: "Invalid identifier format or missing id parameter."
 *       404:
 *         description: Identifier not found or unable to resolve.
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
 *                   example: "Identifier not found or unable to resolve."
 */
app.post('/resolve', async (req, res) => {
    const {id} = req.body
    try {
        const controllerDoc = registry.resolve(id)
        res.send(controllerDoc)
    } catch (err) {
        console.error(err)
        res.sendStatus(404)
    }
})

app.post('/clear', async (req, res) => {
    try {
        registry.clear()
        res.sendStatus(200)
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

app.listen(port, () => {
    console.log(`Service [${serviceConfig.name}] listening on port ${port}`)
})
