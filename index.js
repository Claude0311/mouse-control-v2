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

import portfinder from 'portfinder'
import {networkInterfaces} from 'os'
const findport = async (start=5000)=>await portfinder.getPortPromise({port:start})

const main = async()=>{
    const port = process.env.port || await findport()
    const ips = networkInterfaces()
    const ip = Object.entries(ips).reduce((acc,[key,val])=>{
        val.forEach(({family,internal,address})=>{
            if(family==='IPv4' && !internal) acc[key]=address
        })
        return acc
    },{})
    console.log('ip addresses:')
    console.log(ip)
    app.get('/port',(req,res)=>{
        res.send({ip,port})
    })
    app.listen(port,'0.0.0.0',()=>{
        console.log(`server on port ${port}`)
        open(`http://localhost:${port}`)
        setInterval(move,10)
    })
}
main()