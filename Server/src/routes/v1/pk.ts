// Dependencies
import express from "express"
import { KeyPair } from "../../index.js"

// Create app
export const Router = express.Router()

// Returns our public key
Router.get("/", (req, res) => {
    return res.send(KeyPair.publicKey.toString())
})