// Application Entry Point
const express = require('express')
const app = express()
//Make use of the http module in this project and not express
const http = require('http')
const { handleReqRes } = require('./helper/handleReqRes') //import the handleReqRes to deal with requests and responses
const path = require('path')
var dir = path.join(__dirname, 'public');

app.use(express.static(dir));

// App configuration
app.config = {
    name: 'Athlete Races',
    port: process.env.PORT || 3000
}

app.use(express.static(dir))

// Create server
app.createServer = async () => {
    const server = http.createServer(handleReqRes)
    server.listen(app.config.port, () => {
        console.log(`Server is running on port ${app.config.port}`)
    })
    
   
}

// Start the server
app.createServer()
