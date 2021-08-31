import express from 'express'
import clickR from './mClick.js'
import env from 'dotenv'
import  {move, router as moveR} from './mMove.js'
import open from 'open'
import bodyParser from 'body-parser'

env.config('./.env')
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

import path from 'path'
const __dirname = path.resolve();
app.use('/', express.static(__dirname + '/public'))
app.use(moveR)
app.use(clickR)

const port = process.env.port || 5000
app.listen(port,'0.0.0.0',()=>{
    console.log(`server on port ${port}`)
    open(`http://localhost:${port}`)
    setInterval(move,10)
})