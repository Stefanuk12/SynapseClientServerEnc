// Dependencies
import express from "express"

import _sodium from "libsodium-wrappers"
import { SynapseOnly } from "../../index.js"
await _sodium.ready
const { crypto_secretbox_open_easy, crypto_secretbox_easy, randombytes_buf, crypto_secretbox_NONCEBYTES } = _sodium

import { Keys } from "./exch.js"

// Create app
export const Router = express.Router()
Router.use(express.text())
Router.use(SynapseOnly)

// Uses secretbox to decrypt a message and then return it reversed
Router.post("/", (req, res) => {
    // Make sure IP not already registered
    const Key = Keys.find(key => key.IP == req.ip)
    if (!Key)
        return res.status(400).send("not registered")

    // Vars
    const Body = Buffer.from(req.body, "base64")
    const Nonce = Body.subarray(0, 24)
    const CipherText = Body.subarray(24)

    // Decrypt
    const Message = Buffer.from(crypto_secretbox_open_easy(CipherText, Nonce, Key.Key)).toString()

    // Reverse it, encrypt and send
    const Reversed = Message.split("").reverse().join("")
    const NonceB = Buffer.from(randombytes_buf(crypto_secretbox_NONCEBYTES))
    const Encrypted = Buffer.from(crypto_secretbox_easy(Reversed, NonceB, Key.Key))

    // Success, return string reversed. Apppend nonce before cipher
    const Appended = Buffer.concat([NonceB, Encrypted])
    return res.send(Appended.toString("base64"))
})