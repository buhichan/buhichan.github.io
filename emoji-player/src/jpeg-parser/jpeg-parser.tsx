

export function createJPEGFile(arr:Uint8Array){
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext('2d')
    // const image = new Image(arr)
}

const canvas = document.createElement("canvas")

export function getPixelSampleMatrix(file:Blob, pixelSize:number){
    const image = document.createElement("img")
    image.src = URL.createObjectURL(file)
    return new Promise<Uint8ClampedArray[][]>(resolve=>{
        image.onload=()=>{
            const xDimension = image.width / pixelSize
            const yDimension = image.height / pixelSize
            canvas.height = image.height
            canvas.width = image.width
            const ctx = canvas.getContext('2d')
            ctx.drawImage(image,0,0)
            // console.log(`pixel size ${pixelSize}, image w ${image.width} h ${image.height}, dimension w ${xDimension} h ${yDimension}`)
            let res:Uint8ClampedArray[][] = []
            for(let i=0; i<yDimension; i++){
                let row = []
                for(let j=0;j<xDimension;j++){
                    const pixel = ctx.getImageData(j*pixelSize,i*pixelSize,1,1)
                    row.push(pixel.data)
                }
                res.push(row)
            }
            resolve(res)
        }
    })
}

document.body.append(canvas)