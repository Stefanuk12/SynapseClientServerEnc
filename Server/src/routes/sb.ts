// Dependencies
import express from "express"
import { crypto_secretbox_open_easy } from "libsodium-wrappers"
import { KeyPair } from "../index.js"
import { Keys } from "./exch.js"

// Create app
export const Router = express.Router()

// Uses secretbox to decrypt a message and then return it reversed
Router.get("/sb", (req, res) => {
    // Make sure IP not already registered
    const Key = Keys.find(key => key.IP == req.ip)
    if (!Key)
        return res.status(400).send("not registered")

    // Decrypt
    const BufferKey = Buffer.from(Key.Key)
    const Nonce = KeyPair.publicKey
    const Message: string = crypto_secretbox_open_easy(req.body, Nonce, BufferKey).toString()

    // Success, return string reversed
    return res.send(Message.split("").reverse().join(""))
})