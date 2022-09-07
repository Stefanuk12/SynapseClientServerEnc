// Dependencies
import express from "express"

import _sodium from "libsodium-wrappers"
import { SynapseOnly } from "../../index.js"
await _sodium.ready
const { crypto_box_NONCEBYTES, crypto_secretbox_open_easy, crypto_secretbox_easy, randombytes_buf, crypto_secretbox_NONCEBYTES } = _sodium

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

    // Decrypt
    const DecodedBody = Buffer.from(req.body, "base64")
    const NonceA = DecodedBody.subarray(0, crypto_box_NONCEBYTES)
    const CipherText = DecodedBody.subarray(crypto_box_NONCEBYTES)
    const Message: string = crypto_secretbox_open_easy(CipherText, NonceA, Key.Key, "text")

    // Reverse it, encrypt and send
    const Reversed = Message.split("").reverse().join("")
    const NonceB = randombytes_buf(crypto_secretbox_NONCEBYTES)
    const Encrypted = crypto_secretbox_easy(Reversed, NonceB, Key.Key, "uint8array")
    const Encrypted64 = Buffer.from(Encrypted).toString("base64")

    // Success, return string reversed
    return res.send(Encrypted64)
})