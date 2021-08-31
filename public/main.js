const div = document.getElementById('container')
const send = document.getElementById('send')
const resDiv = document.getElementById('response')

div.style["background-image"] = "url('test.png')"


const img = new Image
img.src = 'test.png'
let posis = []

let layers = []
img.onload = function(){

    const height = this.height
    const width = this.width
    
    const stage = new Konva.Stage({
        container: 'container',
        width: width,
        height: height,
    });

    let balls
    if(posis.length===0){
        balls = [
            {id:"↙",pos:{x:width/3,y:height*2/3},color:"#FF00FF"},//purple
            {id:"↘",pos:{x:width*2/3,y:height*2/3},color:"#0000FF"},//blue
            {id:"↗",pos:{x:width*2/3,y:height/3},color:"#00FF00"},//yellow
            {id:"↖",pos:{x:width/3,y:height/3},color:"#FF0000"},//red
        ]
    }else{
        balls = [
            {id:"↙",pos:{x:posis[0][0],y:posis[0][1]},color:"#FF00FF"},//purple
            {id:"↘",pos:{x:posis[1][0],y:posis[1][1]},color:"#0000FF"},//blue
            {id:"↗",pos:{x:posis[2][0],y:posis[2][1]},color:"#00FF00"},//yellow
            {id:"↖",pos:{x:posis[3][0],y:posis[3][1]},color:"#FF0000"},//red
        ]
    }
    layers = balls.map(({id,pos:{x,y},color},index)=>{
        const layer = new Konva.Layer()
        const group = new Konva.Group({
            x,
            y,
            draggable: true,
        });
        const circle = new Konva.Circle({
            radius: 30,
            fill: color,
            opacity: 1,
        });
        group.on('mouseover', function () {
            this.getChildren()[0].opacity(0.5)
            document.body.style.cursor = 'pointer';
        });
        group.on('mouseout', function () {
            this.getChildren()[0].opacity(1)
            document.body.style.cursor = 'default';
            // console.log(this.position())
        });
        const lineLen = 20
        const line1 = new Konva.Line({
            points: [lineLen,0,-lineLen,0],
            stroke: 'black',
            strokeWidth: 5,
            lineCap: 'round',
            lineJoin: 'round'
        })
        const line2 = new Konva.Line({
            points: [0,lineLen,0,-lineLen],
            stroke: 'black',
            strokeWidth: 5,
            lineCap: 'round',
            lineJoin: 'round',
        })
        group.add(circle)
        group.add(line1)
        group.add(line2)
        layer.add(group)
        return layer
    })
    
    layers.forEach(lay=>{
        stage.add(lay)
    })
    send.onclick = function(e){
        const data = layers.map(lay=>{
            console.log(lay.getChildren()[0].position())
            return lay.getChildren()[0].position()
        })
        axios.post('/setPos',data).then(res=>{
            console.log(res)
            resDiv.innerHTML="ok"
        }).catch(
            resDiv.innerHTML="error"
        )
    }
}

const loadImg = async ()=>{
    const {data} = await axios.get('/image')
    posis = data
    div.style["background-image"] = "url('new.png')"
    img.src = 'new.png'
}
loadImg()


