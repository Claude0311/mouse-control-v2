// import axios from 'axios'
// import env from 'dotenv'
// import express from 'express'
// import asyncHandler from "express-async-handler"
// import fs from 'fs'
// import robot from "robotjs"
// import Jimp from 'jimp'
// import path from 'path'
const axios = require('axios')
const env = require('dotenv')
const express = require('express')
const asyncHandler = require('express-async-handler')
const fs = require('fs')
const robot = require('robotjs')
const Jimp = require('jimp')
const path = require('path')
const PerspT = require('perspective-transform');
// const imageBrightness = require('image-brightness')

env.config()

let baseUrl = ""
let screen = []

// const __dirname = path.resolve()
// const confpath = path.join(__dirname,'dist/config.json')
const confpath = './laser-mouse-conf.json'
const save = ()=>{
    fs.writeFile(confpath, JSON.stringify({screen,baseUrl}), (err) => {
        if (err) {
            console.log(err)
            return //throw err
        }
        console.log("JSON data is saved.");
    })
}
console.log('read')
fs.readFile(confpath, 'utf-8', (err, data) => {
    if (err) {
        console.log('config empty')
        return
    }
    const conf = JSON.parse(data.toString())
    console.log('config',conf)
    if(conf.screen) screen = conf.screen
    if(conf.baseUrl) baseUrl = conf.baseUrl
    init()
})

let gettingImg = false
let shootinglaser = false
const {width,height} = robot.getScreenSize()

const router = express.Router()

router.post('/setPos',(req,res)=>{
    console.log('pos',req.body)
    screen = req.body.map(({x,y})=>[x,y])
    save()
    init()
    res.end()
})

router.post('/baseUrl',(req,res)=>{
    const {baseUrl:bu} = req.body
    baseUrl = bu
    console.log(bu)
    save()
    res.send()
})
router.get('/baseUrl',(req,res)=>{
    console.log('RPi url',baseUrl)
    res.send({baseUrl})
})

let laserCon = true
router.post('/laserControl',(req,res)=>{
    const {laser} = req.body
    laserCon = laser
    res.end()
})
router.get('/laserControl',(req,res)=>{
    res.send({laser:laserCon})
})

router.post('/laser',(req,res)=>{
    const {sig} = req.body
    console.log(sig)
    switch(sig){
        case "0":
            shootinglaser = false
            break
        case "1":
            shootinglaser = true
            break
        default:
            console.log(`sig ${sig} not valid`)
    }
    res.end()
})

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
router.get('/image',asyncHandler(async (req,res)=>{
    gettingImg = true
    const {data} = await axios.post(baseUrl+'/config',{iso:1000})
    let count = 0
    let img
    while(true){
        await delay(1000)
        count += 1
        img = await axios.get(baseUrl+'/image',{
            responseType: "arraybuffer"
        }).catch(e=>false)
        if(img) {
            console.log(count)
            break
        }
        if(count>10) throw Error('restart takes too long')
    }
    axios.post(baseUrl+'/config',{iso:200})
    gettingImg = false
    console.log('got pi img')
    const im = await Jimp.read(Buffer.from(img.data))
    const imguri = await im.brightness(0.15).getBase64Async(Jimp.AUTO)
    res.send({screen,imguri})
}))

let perspT
const init = ()=>{
    if(screen.length!==4) return false
    srcCorners = screen.reduce((acc,[x,y])=>{
        acc.push(x)
        acc.push(y)
        return acc
    },[])
    console.log(srcCorners)
    dstCorners = [0,height-1,width-1,height-1,width-1,0,0,0]
    console.log(dstCorners)
    perspT = PerspT(srcCorners, dstCorners)
    console.log(perspT.transform(screen[0][0],screen[0][1]))
}
const calPos = (x,y)=>{
    const position = perspT.transform(x,y)
    if(position[0]>width-1) position[0] = width-1
    else if(position[0]<0) position[0] = 0
    if(position[1]>height-1) position[1] = height-1
    else if(position[1]<0) position[1] = 0
    return position
}
const move = async ()=>{
    if(screen.length!==4 || gettingImg || !shootinglaser || !laserCon) return false
    const {data:center} = await axios.get(baseUrl+'/centers').catch((e)=>{
        // console.log(e)
        return {data:false}
    })
    if(!center || center.length===0) return false
    const [x,y,z] = center[0]
    const [toX,toY] = calPos(x,y)
    robot.moveMouse(toX,toY)
    return true
}
module.exports = {move, router}