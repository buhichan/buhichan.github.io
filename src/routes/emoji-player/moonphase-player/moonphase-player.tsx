import * as React from "react";
import { Subject } from "rxjs";

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

type Props = {
    file:File
}

const dictionary = ["🌑","🌒","🌓","🌔","🌕"] //,"🌖","🌗","🌘"]

const skintones = ["🧑🏿","🧑🏾","🧑🏽","🧑🏼","🧑🏻"]

let FPS = 30

let VIDEO_LENGTH = 30

export default function MoonphasePlayer (props:Props){
    const [line,setLines] = React.useState([] as React.ReactNode[])
    // const [printed,print] = React.useState(null as React.ReactNode)
    const [command,setCommand] = React.useState(`-ss 00:00:00 -i input.webm -vframes ${FPS * VIDEO_LENGTH} output-%03d.jpg`)

    const ref = React.useRef(null)

    const print = (str:string)=>{
        ref.current && (ref.current.innerHTML = str)
    }

    React.useEffect(()=>{
        if(!props.file || !command){
            return
        }
        setLines([])
        print("loading..., please wait.")
        const {output,files} = getFrames(props.file, command.split(" ")) 
        const sub = output.pipe(
            // map(({type,data})=>{
                
                // return <span style={{
                //     color:type==='stderr'?"red":type==="stdout"?"black":"gray",
                //     display:"block",
                // }}>
                //     {data}    
                // </span>
            // }),
            // scan((a:React.ReactNode[],b:React.ReactNode)=>a.concat(b),[] as React.ReactNode[])
        ).subscribe(x=>{
            // if(process.env.NODE_ENV === 'development'){
            if(x.data && x.data.startsWith("frame=")){
                const [_,currentFrame] = x.data.split(/\s+/g)
                print(`${currentFrame}/900`)
            }
            // console.log(x.data)
            // }
        })
        
        // const sub = new Subscription()

        // const frame$ = new Subject<React.ReactNode>()

        files.subscribe(async (files)=>{
            console.log(`got ${files.length} images`)
            let frames:string[] = [];
            let outputIndex = null as null | number;
            for(let i in files){
                const file = files[i]
                const blob = new Blob([file.data],{type:"image/jpeg"})
                const pixels = await getPixelSampleMatrix(blob,20)
                frames.push(pixels.map(row=>{
                    return row.map(pixel=>{
                        const brightness = (0.2126*pixel[0]/255 + 0.7152*pixel[1]/255 + 0.0722*pixel[2]/255) * 2
                        return skintones[Math.min(Math.floor(brightness * skintones.length),skintones.length-1)]
                        
                        // return `<span class="pixel" style="background: rgba(${pixel.join(",")})"></span>`
                    }).join("")
                }).join("\n"))
                if(outputIndex === null){
                    outputIndex = 0
                    let timer = setInterval(()=>{
                        if(outputIndex>frames.length - 1){
                            // frame$.next(frames[frames.length-1])
                            print(frames[frames.length-1])
                        }else{
                            // frame$.next(frames[outputIndex])
                            print(frames[frames.length-1])
                            outputIndex ++
                        }
                        if(outputIndex === files.length){
                            clearInterval(timer)
                            // frame$.complete()
                        }
                    },1000/FPS)
                }
            }
        })

        // sub.add(frame$.subscribe(print))

        return ()=>sub.unsubscribe()

    },[props.file,command])

    return <div>
        Can Only Play the first 900 frames.
        {
            // <input type="search" style={{width:500}} defaultValue="-ss 00:00:01 -i input.webm -vframes 12 output-%03d.jpg" onKeyDown={e=>{
            //     if(e.key==='Enter'){
            //         setCommand(e.currentTarget.value) 
            //     }
            // }} />
        }
        <div>
            {
                // line.map((x,i)=>{
                //     return <span key={i}>
                //         {x}
                //     </span>
                // })
            }
        </div>
        <style>
            {`.pixel{
                display:inline-block;
                width:10px;
                height:10px;
            }`}
        </style>
        <div ref={ref} style={{whiteSpace:"pre-wrap"}}>

        </div>
    </div>
}

function readFile(file:File){
    return new Promise<ArrayBuffer>((resolve,reject)=>{
        const reader = new FileReader()
        reader.readAsArrayBuffer(file)
        reader.onload=()=>{
            resolve(reader.result as ArrayBuffer)
        }
        reader.onerror=reject
    })
}

function getFrames(file:File, commands:string[]){
    const mime = file.type
    const [_,subtype] = mime.split("/")
    const output = new Subject<{type:"stdout"|"stderr",data:string}>()
    const files = new Subject<{name:string,data:Uint8Array}[]>()
    readFile(file).then((data)=>{
        var testData = new Uint8Array(data)
        let ffmpeg = 
            subtype === 'webm' ? new Worker("nm/ffmpeg.js/ffmpeg-worker-webm.js") : 
            subtype === 'mp4' ? new Worker("nm/ffmpeg.js/ffmpeg-worker-mp4.js") : 
            null
        if(!ffmpeg){
            return []
        }
    
        ffmpeg.postMessage({
            type:"run",
            MEMFS: [{name: `input.${subtype}`, data: testData}],
            arguments: commands.concat('-hide_banner')
        })

        let i = 0
        // Write out.webm to disk.
        ffmpeg.addEventListener('message',e=>{
            // console.log(e.data.type)
            if(e.data.type === 'exit'){
                // console.log('exit',e.data.data)
            }else if(e.data.type==='done'){
                // console.log(`done`, e.data.data)
                files.next(e.data.data.MEMFS)
                ffmpeg.terminate()
                files.complete()
                output.complete()
            }else{
                output.next(e.data)
            }
        })
    })
    return {output,files}
}