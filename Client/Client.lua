local HttpService = game:GetService("HttpService")
-- // Vars
local ServerConfiguration = {
    Host = "example.com",
    PublicKey = "pk", -- // the path to the public key (on server)
    KeyExchange = "exch", -- // Endpoint for key exchange
    SBTest = "sb",
    AESTest = "aes"
}

-- // Grabs the server public key
local URLFormat = "https://%s/%s"
local ServerPK = syn.request({
    Method = "GET",
    Url = URLFormat:format(ServerConfiguration.Host, ServerConfiguration.PublicKey)
}).Body

-- // Generate our shared key with 256 bit length
local Key = syn.crypt.random(256)

-- // Seal our key
local SealedKey = syn.crypt.seal.encrypt(Key, ServerPK)

-- // Send the key to the server
syn.request({
    Method = "POST",
    Url = URLFormat:format(ServerConfiguration.Host, ServerConfiguration.KeyExchange),
    Body = SealedKey
})

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