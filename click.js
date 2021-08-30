import express from "express"
import robot from "robotjs"
import asyncHandler from "express-async-handler"
import axios from "axios"
import env from 'dotenv'

env.config('./.env')

const router = express.Router()

router.get('/',()=>{})

router.get('/image',asyncHandler(async (req,res)=>{
    const baseUrl = process.env.baseUrl
    const img = await axios.get(baseUrl+'/image')
    res.send(img)
}))

router.post('/ck',(req,res)=>{
    const {sig} = req.body
    switch(sig){
        case "1":
            robot.mouseClick()
            break
        case "2":
            robot.mouseClick("right")
            break
        case "3":
            robot.mouseToggle('down')
            break
        case "4":
            robot.mouseToggle('up')
            break
        default:
            console.log(`${sig} comman not found`)
    }
    res.send('ok')
})

router.post('/sc',(req,res)=>{
    const {speed} = req.body
    const scroll = parseInt(parseFloat(speed)*100)
    robot.scrollMouse(scroll, 0)
    res.send('ok')
})

router.use((err,req,res,next)=>{
    console.log(err)
    res.status('403').send('error occur')
})

export default router