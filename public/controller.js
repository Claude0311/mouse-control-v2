const laserBtn = document.getElementById('laserControl')
axios.get('/laserControl').then(({data})=>{
    const {laser} = data
    laserBtn.checked=laser
}).catch(e=>console.log(e))
laserBtn.onclick = function (){
    axios.post('/laserControl',{laser:this.checked})
}

const urlText = document.getElementById('baseUrl')
const urlSend = document.getElementById('urlSend')
axios.get('/baseUrl').then(({data})=>{
    const {baseUrl:bu} = data
    urlText.value = bu
}).catch(e=>console.log(e))
urlSend.onclick = function (){
    axios.post('/baseUrl',{baseUrl:urlText.value})
}