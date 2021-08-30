import express from 'express'
import router from './click'
import env from 'dotenv'
import move from './move'

env.config('./.env')
const app = express()

app.use(router)

const port = 3000 || process.env.port
const baseUrl = process.env.baseUrl
app.listen(port,'0.0.0.0',()=>{
    console.log(`server on port ${port}`)
    console.log(`listen to RPi on ${baseUrl}`)
    setInterval(move,0)
})