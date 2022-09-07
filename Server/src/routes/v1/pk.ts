// Dependencies
import express from "express"
import { KeyPair, SynapseOnly } from "../../index.js"

// Create app
export const Router = express.Router()
Router.use(SynapseOnly)

// Returns our public key
Router.get("/", (req, res) => {
    return res.send(Buffer.from(KeyPair.publicKey).toString("base64"))
})