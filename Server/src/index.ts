// Dependencies
import * as fs from "fs"
import * as path from "path"
import express, { Request, Response, NextFunction } from "express"

import _sodium from "libsodium-wrappers"
await _sodium.ready
const {crypto_box_keypair, crypto_sign_open} = _sodium

// Create app
const Port = 3000
export const App = express()
export default App
export const DefaultPath = new URL("./routes/", import.meta.url)

// Generate our public, private key pair
export const KeyPair = crypto_box_keypair()
console.log(Buffer.from(KeyPair.privateKey).toString("base64"))
// Add routes
async function AddRoutes(dirPath: URL = DefaultPath){
    // Loop through directory
    for (let dir of fs.readdirSync(dirPath, {withFileTypes: true})) {
        // See if is folder
        let urlPath = new URL(dir.name, dirPath)
        if (dir.isDirectory()){
            // Repeat
            await AddRoutes(new URL(dir.name + "/", dirPath))
            continue
        }

        // Ignore
        if (path.extname(dir.name) != ".js" || dir.name == "index.js"){
            continue
        }

        // Figure out the paths and import
        let router = await import(urlPath.href)
        let appPath = urlPath.pathname
        appPath = appPath.substring(appPath.indexOf("routes/") + 6, appPath.indexOf(".js"))

        // Load and output
        App.use(appPath, router.Router)
        console.log(`Loaded: ${appPath}`)
    }
}
AddRoutes()

// Middleware that makes sure that requests made from Synapse
const SynapsePublicKey = Buffer.from("qgq26x4+4FWdLzRpGZytZfEQJlOeusryQC8ppC2BEVA=", "base64")
export function SynapseOnly(req: Request, res: Response, next: NextFunction) {
    // Ensure we got the signature
    // const Signature = req.headers["syn-signature"]?.toString()
    // if (!Signature)
    //     return res.status(401).send("missing syn-signature header")

    // // Verify the signature
    // try {
    //     crypto_sign_open(Buffer.from(Signature, "base64"), SynapsePublicKey)
    // } catch (e: any) {
    //     return res.status(403).send("invalid syn-signature header, failed to verify")
    // }

    // Continue
    next()
}

// Start the server
App.listen(Port, async () => {
    console.log(`sx-cs-enc-demo: started at http://localhost:${Port}`)
})