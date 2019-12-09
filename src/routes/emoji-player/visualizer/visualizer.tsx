import * as React from "react";
import { mediaFileReader } from "../file-reader";
import { FlvTag, parseFlv } from "../flv-parser/flv-parser";
import FlvRenderer from "./flv-renderer";

export default function VideoVisualizer(){
    const [blocks,setBlocks] = React.useState(null as null | FlvTag[])
    const [error,onError] = React.useState(null as null | Error)
    const onFile=(file:Blob)=>{
        if(file.type.includes('flv')){
            parseFlv(mediaFileReader(file)).then(setBlocks)
        }
    }
    React.useEffect(()=>{
        onError(null)
        fetch("assets/barsandtone.flv").then(x=>x.blob()).then(onFile).catch(onError)
    },[])
    return <div>
        {
            error && <div style={{color:"#f00"}}>{error.stack}</div>
        }
        {
            <input type="file" accept="video/webm" onChange={(e)=>{
                if(!e.currentTarget.files){
                    return
                }
                const file = e.currentTarget.files[0]
                if(file){
                    onFile(file)
                }
            }} />
        }
        {
            blocks && <FlvRenderer tags={blocks} />
        }
    </div>
}

// function parseMp4File(){
//     const {parseBoxes,globalData} = makeParser()
//     return fetch("/sample mp4.mp4")
//         .then(res=>res.blob())
//         .then(blob=>{
//             return parseBoxes(mediaFileReader(blob))
//         })
//         .then((boxes)=>{
//             return {
//                 type:"mp4",
//                 data:{
//                     boxes,
//                     globalData
//                 }
//             }
//         })
// }

// function parseFlvFile(){
//     return fetch("/barsandtone.flv")
//         .then(res=>res.blob())
//         .then(blob=>{
//             return parseFlv(mediaFileReader(blob))
//         })
//         .then((boxList)=>{
//             return {
//                 type:"flv",
//                 data:{
//                     tags:boxList
//                 }
//             }
//         })
// }
    