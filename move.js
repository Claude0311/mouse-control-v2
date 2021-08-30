import axios from 'axios'
import env from 'dotenv'
env.config('./.env')
baseUrl = process.env.baseUrl

const init = async ()=>{
    const img = await axios.get(baseUrl+'/image')
}

const move = async ()=>{
    const center = await axios.get(baseUrl+'/centers').catch((e)=>{
        console.log(e)
        return false
    })
    if(!center) return false
    console.log(`center ${center}`)
}

export default move