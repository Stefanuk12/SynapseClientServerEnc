// Dependencies
import got from "got"
import libsodium from "libsodium-wrappers"
await libsodium.ready

// Grab PK
const ServerPK = Buffer.from((await got("http://localhost:3000/v1/pk")).body, "base64")

// Create a key
const Key = Buffer.from(libsodium.randombytes_buf(libsodium.crypto_secretbox_KEYBYTES))
const EncryptedKey = Buffer.from(libsodium.crypto_box_seal(Key, ServerPK))

// Exchange
await got.post("http://localhost:3000/v1/exch", {
    headers: {
        "content-type": "text/plain"
    },
    body: EncryptedKey.toString("base64")
})
console.info("Successfully did key exchange")

// Message
const Message = "Hello World!"
const ReversedMessage = Message.split("").reverse().join("")
const Nonce = Buffer.from(libsodium.randombytes_buf(libsodium.crypto_secretbox_NONCEBYTES))
const EncryptedMessage = Buffer.from(libsodium.crypto_secretbox_easy(Message, Nonce, Key))
const Appended = Buffer.concat([Nonce, EncryptedMessage])

// Send it and get response
const ServerMessage = Buffer.from(await got.post("http://localhost:3000/v1/sb", {
    headers: {
        "content-type": "text/plain"
    },
    body: Appended.toString("base64")
}).text(), "base64")

// Decrypt
console.info("Got SB response")
const SNonce = ServerMessage.subarray(0, 24)
const SCipher = ServerMessage.subarray(24)
console.log(SNonce, SCipher)
const DecryptedSMessage = Buffer.from(libsodium.crypto_secretbox_open_easy(SCipher, SNonce, Key)).toString()

// Checks
console.info(`Decrypted response as: ${DecryptedSMessage}`)

if (DecryptedSMessage == ReversedMessage)
    console.info("SB Test Passed!")