// Dependencies
import express from "express"
import { KeyPair } from "../../index.js"

import _sodium from "libsodium-wrappers"
await _sodium.ready
const { crypto_box_seal_open } = _sodium

// Create app
export const Router = express.Router()
Router.use(express.text())

// Vars
interface Key {
    Key: string
    IP: string
}
export const Keys: Key[] = []

// Exchange a shared key to use
Router.post("/", (req, res) => {
    // Make sure IP not already registered
    if (Keys.find(key => key.IP == req.ip))
        return res.status(400).send("already registered")

    // Decrypt
    const CipherText = Buffer.from(req.body, "base64")
    console.log(CipherText)
    const DecryptedKey = crypto_box_seal_open(CipherText, KeyPair.publicKey, KeyPair.privateKey).toString()

    // Store
    Keys.push({
        Key: DecryptedKey,
        IP: req.ip
    })

    // Success
    return res.sendStatus(200)
})