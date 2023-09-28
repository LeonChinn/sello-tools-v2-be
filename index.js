const express = require('express')
const app = express()
const tools = require('./routes/tool')
const database = require('./database')
const cors = require('cors')
const fileupload = require('express-fileupload')

app.set('trust proxy', 1)

//parse form data
app.use(express.urlencoded({extended: false}))

app.use(fileupload())

app.use(express.json())

app.use(cors()) 

app.use('/api/tool', tools);


const start = async() => {
    app.listen(3001, () => {
        console.log(`Server is listening on port 3001...`)
    })
}

start();