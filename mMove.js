import axios from 'axios'
import env from 'dotenv'
import express from 'express'
import asyncHandler from "express-async-handler"
import fs from 'fs'
import robot from "robotjs"
import Jimp from 'jimp'
env.config('./.env')

let baseUrl = ""
let screen = []
const save = ()=>{
    fs.writeFile('config.json', JSON.stringify({screen,baseUrl}), (err) => {
        if (err) throw err
        console.log("JSON data is saved.");
    })
}
console.log('reading')
fs.readFile('config.json', 'utf-8', (err, data) => {
    console.log('log done')
    if (err) throw err
    const conf = JSON.parse(data.toString())
    console.log('config',conf)
    if(conf.screen) screen = conf.screen
    if(conf.baseUrl) baseUrl = conf.baseUrl
})
let det = []
let sideLen = []
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
    console.log('baseurl',baseUrl)
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

router.get('/image',asyncHandler(async (req,res)=>{
    console.log('require')
    gettingImg = true
    const img = await axios.get(baseUrl+'/image',{
        responseType: "stream"
    })
    gettingImg = false
    console.log('get done')
    const pipeload = img.data.pipe(fs.createWriteStream("./public/new.png"))
    pipeload.on('finish',async ()=>{
        const im = await Jimp.read('./public/new.png')
        await im.brightness(0.15)
        .writeAsync('./public/new.png')
        res.send(screen)
    })
}))

const init = ()=>{
    if(screen.length!==4) return false
    det = [
        screen[0][0]*screen[1][1]-screen[0][1]*screen[1][0],
        screen[1][0]*screen[2][1]-screen[1][1]*screen[2][0],
        screen[2][0]*screen[3][1]-screen[2][1]*screen[3][0],
        screen[3][0]*screen[0][1]-screen[3][1]*screen[0][0]
    ]
    sideLen = [
        ((screen[0][0]-screen[1][0])**2+(screen[0][1]-screen[1][1])**2)**0.5,
        ((screen[1][0]-screen[2][0])**2+(screen[1][1]-screen[2][1])**2)**0.5,
        ((screen[2][0]-screen[3][0])**2+(screen[2][1]-screen[3][1])**2)**0.5,
        ((screen[3][0]-screen[0][0])**2+(screen[3][1]-screen[0][1])**2)**0.5
    ]
}
const calPos = (x,y)=>{
    const area = [
        - (det[0]+y*(screen[1][0]-screen[0][0])-x*(screen[1][1]-screen[0][1])),
        - (det[1]+y*(screen[2][0]-screen[1][0])-x*(screen[2][1]-screen[1][1])),
        - (det[2]+y*(screen[3][0]-screen[2][0])-x*(screen[3][1]-screen[2][1])),
        - (det[3]+y*(screen[0][0]-screen[3][0])-x*(screen[0][1]-screen[3][1]))
    ]
    const innerH = [
        area[0]/sideLen[0],
        area[1]/sideLen[1],
        area[2]/sideLen[2],
        area[3]/sideLen[3]
    ]
    const position = [
        width * innerH[3]/(innerH[1]+innerH[3]),
        height - height*innerH[0]/(innerH[0]+innerH[2])
    ]
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
        return false
    })
    // console.log(center)
    if(!center || center.length===0) return false
    // console.log(`centers ${center}`)
    const [x,y,z] = center[0]
    const [toX,toY] = calPos(x,y)
    robot.moveMouse(toX,toY)
    return true
}

export {move, router}