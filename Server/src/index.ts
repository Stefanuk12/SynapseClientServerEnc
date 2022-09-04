// Dependencies
import * as fs from "fs"
import * as path from "path"
import express from "express"
import { crypto_box_keypair } from "libsodium-wrappers"

// Create app
const Port = 3000
export const App = express()
export default App
export const DefaultPath = "./lib/routes"

// Generate our public, private key pair
export const KeyPair = crypto_box_keypair()

// Add routes
async function AddRoutes(dirPath: string = DefaultPath){
    // Loop through directory
    for (let dir of fs.readdirSync(dirPath, {withFileTypes: true})) {
        // See if is folder
        if (dir.isDirectory()){
            // Repeat
            AddRoutes(dirPath + "/" + dir.name)
            continue
        }

        // Ignore
        if (path.extname(dir.name) != ".js" || dir.name == "index.js"){
            continue
        }

        // Figure out the paths and import
        let basePath = `./${dirPath.substring(DefaultPath.length + 1)}`
        let routerPath = `${basePath}/${dir.name}`
        let router = await import(routerPath)
        routerPath = `${basePath.substring(1)}/${path.parse(dir.name).name}`

        // Load and output
        App.use(routerPath, router.Router)
        console.log(`Loaded: ${routerPath}`)
    }
}
AddRoutes()

// Start the server
App.listen(Port, async () => {
    console.log(`sx-cs-enc-demo: started at http://localhost:${Port}`)
})