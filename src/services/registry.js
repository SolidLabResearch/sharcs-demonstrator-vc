import express from 'express'
import bodyParser from 'body-parser'
import {Registry} from "../controllers/registry.js";
import config from '../config.js'

const app = express()
app.use(bodyParser.json())
const port = config.registry.port;
const registry = new Registry()

app.post('/register', async (req, res) => {
    const {id, controllerDoc} = req.body
    console.log(`@registry/register: ${id}`)
    try {
        registry.register(id, controllerDoc)
        // TODO: catch & handle potential errors
        res.send({ id })
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

app.post('/resolve', async (req, res) => {
    const {id} = req.body
    console.log(`@registry/resolve: ${id}`)
    const controllerDoc = registry.resolve(id)
    // TODO: catch & handle potential errors
    res.send(controllerDoc)
})

app.post('/clear', async (req, res) => {
    console.log(`@registry/clear`)
    registry.clear()
    res.send(200)
})

app.listen(port, () => {
    console.log(`Service [Registry] listening on port ${port}`)
})
