

const phases = ["🌑","🌒","🌓","🌔","🌕","🌖","🌗","🌘"]

const root:HTMLMainElement = document.getElementById("root")

// const pixelSize = 2

function getBrightness([R,G,B,A]:Uint8ClampedArray){
    return (0.2126*R/255 + 0.7152*G/255 + 0.0722*B/255) * (A / 255)
}

function getMoonphaseChar(matrix:number[][],x:number,y:number){
    if(matrix.length === 0 || x >= matrix.length - 2 || y >= matrix[0].length - 2){
        return phases[0]
    }
    const leftBrightness = (matrix[x][y] + matrix[x][y+1] + matrix[x][y+2]) / 3
    const middleBrightness = (matrix[x+1][y] + matrix[x+1][y+1] + matrix[x+1][y+2]) / 3
    const rightBrightness = (matrix[x+2][y] + matrix[x+2][y+1] + matrix[x+2][y+2]) / 3

    if(leftBrightness < 0.5){
        if(middleBrightness >= 0.5){
            return "🌔"
        }else if(middleBrightness > 0.5){
            return "🌓"
        }else if(rightBrightness > 0.5){
            return "🌒"
        }else{
            return "🌑"
        }
    }else{
        if(middleBrightness < 0.5){
            return "🌘"
        }else if(middleBrightness <0.5){
            return "🌗"
        }else{
            if (rightBrightness < 0.5){
                return "🌖"
            }else{
                return "🌕"
            }
        }
    }
}

function getPixelSize(pixels:number){
    if(pixels > 1000){
        return 5
    }else{
        return 2
    }
}

function initTextToMoonphase(){
    const input = document.getElementById("text") as HTMLInputElement
    input.addEventListener("change",(e)=>{
        const text = input.value
        const canvas = document.querySelector('canvas')
        const ctx = canvas.getContext('2d')
        const fontSizeEl = document.querySelector("#fontsize") as HTMLInputElement
        let fontSize = 20
        fontSizeEl && (fontSize = Number(fontSizeEl.value))
        canvas.width = fontSize
        canvas.height = text.length * (fontSize)
        ctx.clearRect(0,0,canvas.width,canvas.height)
        ctx.fillStyle="#ffffff"
        ctx.font=fontSize + "px Arial"
        ctx.textBaseline="top"
        for(let i=0;i<text.length;i++){
            ctx.fillText(text[i],0, (fontSize) * i)
        }
        const matrix = getMoonphaseText(canvas, 1)
        outputMoonphaseText(matrix,canvas.width * 10,canvas.height * 10, 1)
    })
}

function initImageToMoonphase(){
    const input = document.getElementById("file") as HTMLInputElement
    input.addEventListener("change",(e)=>{
        const files = input.files
        const file = files[0]
        if(file){
            const glob = URL.createObjectURL(file)
            const image = document.querySelector("#image") as HTMLImageElement
            image.src = glob
            output('loading...',200,100)
            image.addEventListener("load",()=>{
                const width = image.clientWidth
                const height = image.clientHeight
                const canvas = document.querySelector("canvas")
                const ctx = canvas.getContext("2d")
                canvas.height = height
                canvas.width = width
                ctx.drawImage(image,0,0)
                output('generating...',200,100)
                const pixelSize = getPixelSize(width)
                const moonphaseMatrix = getMoonphaseText(canvas,pixelSize)
                outputMoonphaseText(moonphaseMatrix,width,height)
            })
        }
    })
}

function output(str:string,width:number,height:number,scale = 1){
    const pre = document.querySelector('#output') as HTMLElement
    pre.innerHTML = str
    pre.style.transform=`scale(${scale})`
    pre.style.height=height/scale+"px"
    pre.style.width=width/scale+"px"
}

function outputMoonphaseText(matrix:string[][],width:number,height:number,scale=0.1){
    output(matrix.map(x=>x.join("")).join("\n"),width,height,scale)
}

function getMoonphaseText(canvas:HTMLCanvasElement, pixelSize){
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    const w = width / pixelSize
    const h = height / pixelSize
    const ctx = canvas.getContext("2d")
    let brightnessMatrix = []
    for(let i = 0; i<w; i++){
        brightnessMatrix[i] = []
        for(let j=0; j<h; j++){
            const pixelData = ctx.getImageData(i*pixelSize,j*pixelSize,pixelSize,pixelSize)
            const color = pixelData.data
            const brightness = getBrightness(color)
            brightnessMatrix[i][j] = brightness
        }
    }
    const moonphaseMatrix = []
    for(let i=0;i<brightnessMatrix.length-2;i++){
        for(let j=0;j<brightnessMatrix[i].length-2;j++){
            if(!moonphaseMatrix[j])
                moonphaseMatrix[j] = []
            moonphaseMatrix[j][i] = getMoonphaseChar(brightnessMatrix,i,j)
        }
    }
    return moonphaseMatrix
}

function main(){
    initImageToMoonphase()
    initTextToMoonphase()
}

window.onload=main