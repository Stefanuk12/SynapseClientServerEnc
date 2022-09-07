-- // Services
local HttpService = game:GetService("HttpService")

-- // Vars
local Formatting = {
    GotServerPK = "Got server public key as the following:\nB64: %s\nDecoded: %s\n",
    KeyExchangeError = "Unable to perform key exchange. Error: %s\n"
}
local ServerConfiguration = {
    Host = "localhost",
    PublicKey = "pk", -- // the path to the public key (on server)
    KeyExchange = "exch", -- // Endpoint for key exchange
    SBTest = "sb",
    AESTest = "aes"
}

-- // Grabs the server public key
local URLFormat = "http://%s:3000/v1/%s"
local _ServerPK = syn.request({
    Method = "GET",
    Url = URLFormat:format(ServerConfiguration.Host, ServerConfiguration.PublicKey)
}).Body
local ServerPK = syn.crypt.base64.decode(_ServerPK)
rconsoleinfo(Formatting.GotServerPK:format(_ServerPK, ServerPK))

-- // Generate our shared key with 256 bit length
local Key = syn.crypt.random(32)

-- // Seal our key
local SealedKey = syn.crypt.seal.encrypt(Key, ServerPK)

-- // Send the key to the server
local ExchangeResponse = syn.request({
    Method = "POST",
    Url = URLFormat:format(ServerConfiguration.Host, ServerConfiguration.KeyExchange),
    Headers = {
        ["Content-Type"] = "text/plain"
    },
    Body = SealedKey
})
if (not ExchangeResponse.Success) then
    return rconsoleerr(Formatting.KeyExchangeError:format(ExchangeResponse.Body))
end

-- // The server then decrypts the sealed box and has our shared key.
-- // We can then use this shared key to derive other things, or use in other things.
-- // For example, use this key within a secretbox

local function SendEncryptedSB(Message, AdditionalData)
    -- // Encrypt with our shared key
    local EncryptedMessage = syn.crypt.encrypt(Message, Key, AdditionalData)

    -- // Send the request
    local Response = syn.request({
        Method = "POST",
        Url = URLFormat:format(ServerConfiguration.Host, ServerConfiguration.SBTest),
        Headers = {
            ["Content-Type"] = "text/plain"
        },
        Body = EncryptedMessage
    }).Body

    -- // Decrypt the response
    local DecodedResponse = syn.crypt.decrypt(Response, Key, AdditionalData)

    -- // Verify
    return DecodedResponse == Message:reverse()
end

-- // This example below uses AES

local function SendEncryptedAES(Message)
    -- // Encrypt with our shared key
    local Nonce = syn.crypt.random(16)
    local EncryptedMessage = syn.crypt.custom.encrypt("aes-gcm", Message, Key, Nonce)

    -- // Send the request
    local Response = syn.request({
        Method = "POST",
        Url = URLFormat:format(ServerConfiguration.Host, ServerConfiguration.AESTest),
        Headers = {
            ["Content-Type"] = "text/plain"
        },
        Body = HttpService:JSONEncode({Nonce, EncryptedMessage})
    }).Body

    -- // Decrypt the response
    local DecodedResponse = syn.crypt.custom.decrypt("aes-gcm", Response, Key, Nonce)

    -- // Verify
    return DecodedResponse == Message:reverse()
end

-- // Testing out sending encrypted message
if (SendEncryptedSB("Hello World!")) then
    rconsoleprint("SB Test Passed!\n")
end

if (SendEncryptedAES("Hello World!")) then
    rconsoleprint("AES Test Passed!\n")
end