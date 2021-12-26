//Utility Related Functions

const mimeType = require('mime-types').lookup

const utils = {}

//Write Content to the response object

utils.writeContent = (
    responseObj,
    statusCode = 200,
    fileContent,
    stringify = true,
    file = 'json'
) => {
    const stringifyFile = stringify ? JSON.stringify(fileContent) : fileContent
    responseObj.writeHead(statusCode, { 'Content-type': mimeType(file) })
    responseObj.end(stringifyFile)
}

// Parsing json to js object

utils.parseJSON = (json, defaultReturn = {}) => {
    let object
    try {
        object = JSON.parse(json)
    } catch (e) {
        object = defaultReturn
    } finally {
        return object
    }
}

// Check if object is empty or not

utils.isEmptyObj = (obj) => {
    let isEmpty = true
    for (let i in obj) isEmpty = false
    return isEmpty
}

//Exact RegExp match

utils.regexMatch = (regex, string) => {
    const match = string.match(regex)
    return match && string === match[0]
}

//Export  the utils
module.exports = utils
