// REST Web Services Section
// Definitios of our races api endpoints and routes and methods.

const path = require('path')
const fs = require('fs/promises')
const url = require('url')
var dir = path.join(__dirname, 'public');
const mimeType = require('mime-types').lookup

const { writeContent } = require('../utils/utils')
const {
    getRaces,
    getRaceById,
    getRaceByQuerystring,
    postRace,
    putRace,
    deleteRace
} = require('../controllers/raceController')

const handler = {}

handler.handleReqRes = (req, res) => {
    const allowedMethods = ['get', 'post', 'put', 'delete']
    const reqMethod = req.method.toLowerCase()
    let reqBody = ''
    let parsedUrl = url.parse(req.url, true)
    const queryString = parsedUrl.query
    const parsedUrlWithQuery = parsedUrl.path.replace(/^\/+|\/+$|\??$/g, '')
    // Parse only the route without unwanted slashes and question mark
    parsedUrl = parsedUrl.pathname.replace(/^\/+|\/+$|\??$/g, '')

    req.on('data', (chunkData) => {
        reqBody += chunkData
    })

    // When the full payload comes then 'end' event emit on request
    req.on('end', async () => {
        // If a client requests with unwanted method throw error
        if (allowedMethods.indexOf(reqMethod) < 0) {
            writeContent(res, 405, { status: 'Requested method is not allowed' })
            return
        }

        // ! Get single race - /api/races/:id
        if (parsedUrl.match(/api\/races\/([0-9]+)/) && reqMethod === 'get') {
            const id = parsedUrl.split('/')[2] // => ['api','races',':id']
            getRaceById(req, res, id)
            return
        }

        // ! Get single race - /api/races?key=value
        if (
            parsedUrlWithQuery.match(/api\/races\/?\?\w+=\w+/) &&
            reqMethod === 'get'
        ) {
            getRaceByQuerystring(req, res, queryString)
            return
        }

        // ! Get all races - /api/races
        if (parsedUrl === 'api/races' && reqMethod === 'get') {
            getRaces(req, res)
            return
        }

        // ! Post single race - /api/races
        if (parsedUrl === 'api/races' && reqMethod === 'post') {
            postRace(req, res, reqBody)
            return
        }

        // ! Put single race - /api/races/:id
        if (parsedUrl.match(/api\/races\/([0-9]+)/) && reqMethod === 'put') {
            const id = parsedUrl.split('/')[2]
            putRace(req, res, id, reqBody)
            return
        }

        // ! Delete single race - /api/races/:id
        if (parsedUrl.match(/api\/races\/([0-9]+)/) && reqMethod === 'delete') {
            const id = parsedUrl.split('/')[2]
            deleteRace(req, res, id)
            return
        }

        // If url is empty, load index html
        if (parsedUrl === '') {
            parsedUrl = 'index.html'
        }

        // Static site generation for application frontend
        try {
            // File path wise mimetype set.
            const filePath = path.resolve(__dirname, '../public', parsedUrl)
            const fileContent = await fs.readFile(filePath, 'utf-8')
            writeContent(res, 200, fileContent, false, filePath)
        } catch (e) {
            writeContent(res, 404, { status: '404 Route not found' })
        }
    })
     
}
// Export this handler module
module.exports = handler
