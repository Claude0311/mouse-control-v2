// import express from "express"
// import robot from "robotjs"
// import env from 'dotenv'
const express = require('express')
const robot = require('robotjs')
const env = require('dotenv')

env.config()

const router = express.Router()

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

// export default router
module.exports = router