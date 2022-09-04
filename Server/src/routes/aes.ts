// Dependencies
import express from "express"
import { Keys } from "./exch.js"
import * as crypto from "crypto"

// Create app
export const Router = express.Router()
Router.use(express.json())

// Decrypt an AES-encrypted message and return it reversed
Router.post("/aes", (req, res) => {
    // Make sure IP not already registered
    const Key = Keys.find(key => key.IP == req.ip)
    if (!Key)
        return res.status(400).send("not registered")

    // Decrypt
    const [Nonce, EMessage] = req.body
    const BufferKey = Buffer.from(Key.Key)

    const Decipher = crypto.createCipheriv("aes-256-gcm", BufferKey, Nonce)
    const Message: string = Buffer.concat([Decipher.update(EMessage), Decipher.final()]).toString()

    // Success, return string reversed
    return res.send(Message.split("").reverse().join(""))
})