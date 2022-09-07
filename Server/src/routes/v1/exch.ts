// Dependencies
import express from "express"
import { KeyPair, SynapseOnly } from "../../index.js"

import _sodium from "libsodium-wrappers"
await _sodium.ready
const { crypto_box_seal_open } = _sodium

// Create app
export const Router = express.Router()
Router.use(express.text())
Router.use(SynapseOnly)

// Vars
interface Key {
    Key: Uint8Array
    IP: string
}
export const Keys: Key[] = []

// Exchange a shared key to use
Router.post("/", (req, res) => {
    // Make sure IP not already registered
    if (Keys.find(key => key.IP == req.ip))
        return res.status(400).send("already registered")

    // Decrypt
    console.log(req.body)
    const CipherText = Buffer.from(req.body, "base64")
    let DecryptedKey: Uint8Array 
    try {
        DecryptedKey = crypto_box_seal_open(CipherText, KeyPair.publicKey, KeyPair.privateKey)
    } catch (e: any) {
        return res.status(400).send(e.message)
    }

    // Store
    Keys.push({
        Key: DecryptedKey,
        IP: req.ip
    })

    // Success
    return res.sendStatus(200)
})