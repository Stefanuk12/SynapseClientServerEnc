// Dependencies
import express from "express"

import _sodium from "libsodium-wrappers"
await _sodium.ready
const { crypto_box_NONCEBYTES, crypto_secretbox_open_easy } = _sodium

import { Keys } from "./exch.js"

// Create app
export const Router = express.Router()

// Uses secretbox to decrypt a message and then return it reversed
Router.post("/sb", (req, res) => {
    // Make sure IP not already registered
    const Key = Keys.find(key => key.IP == req.ip)
    if (!Key)
        return res.status(400).send("not registered")

    // Decrypt
    const DecodedBody = Buffer.from(req.body, "base64")
    const BufferKey = Buffer.from(Key.Key)
    const Nonce = DecodedBody.subarray(0, crypto_box_NONCEBYTES)
    const CipherText = DecodedBody.subarray(crypto_box_NONCEBYTES)
    const Message: string = crypto_secretbox_open_easy(CipherText, Nonce, BufferKey).toString()

    // Success, return string reversed
    return res.send(Message.split("").reverse().join(""))
})