// Dependencies
import * as fs from "fs"
import * as path from "path"
import express from "express"

import _sodium from "libsodium-wrappers"
await _sodium.ready
const {crypto_box_keypair} = _sodium

// Create app
const Port = 3000
export const App = express()
export default App
export const DefaultPath = new URL("./routes/", import.meta.url)

// Generate our public, private key pair
export const KeyPair = crypto_box_keypair()

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
        appPath = appPath.substring(appPath.indexOf("routes/") + 6)

        // Load and output
        App.use(appPath, router.Router)
        console.log(`Loaded: ${appPath}`)
    }
}
AddRoutes()

// Start the server
App.listen(Port, async () => {
    console.log(`sx-cs-enc-demo: started at http://localhost:${Port}`)
})