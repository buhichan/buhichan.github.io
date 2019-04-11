import * as React from "react"
import { makeParser } from "../mp4-parser/mp4-parser";
import { mediaFileReader } from "../file-reader";
import { parseFlv } from "../flv-parser/flv-parser";
import MoonphasePlayer from "../moonphase-player/moonphase-player";

export default function(){
    const [file,setFile] = React.useState(null as null | File)
    React.useEffect(()=>{
        fetch("assets/big_buck_bunny.webm").then(x=>x.blob() as any).then(setFile)
    },[])
    return <div>
        {
            <input type="file" accept="video/webm" onChange={(e)=>{
                if(!e.currentTarget.files){
                    return
                }
                const file = e.currentTarget.files[0]
                if(file){
                    setFile(file)
                    // let promise
                    // if(file.type.includes('mp4'))
                    //     promise = parseMp4File()
                    // else if(file.type.includes('flv'))
                    //     promise = parseFlvFile()
                    // else
                    //     return
                    // promise.then(this.setState.bind(this))
                }
            }} />
        }
        { file ? <MoonphasePlayer file={file} /> : null }
    </div>
}

function parseMp4File(){
    const {parseBoxes,globalData} = makeParser()
    return fetch("/sample mp4.mp4")
        .then(res=>res.blob())
        .then(blob=>{
            return parseBoxes(mediaFileReader(blob))
        })
        .then((boxes)=>{
            return {
                type:"mp4",
                data:{
                    boxes,
                    globalData
                }
            }
        })
}

function parseFlvFile(){
    return fetch("/barsandtone.flv")
        .then(res=>res.blob())
        .then(blob=>{
            return parseFlv(mediaFileReader(blob))
        })
        .then((boxList)=>{
            return {
                type:"flv",
                data:{
                    tags:boxList
                }
            }
        })
}
    