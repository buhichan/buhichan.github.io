import {MediaFileReader} from "../file-reader"
import { concatArrayBuffers, makeUInt64BE, UInt64, ab2str, ArrayBufferReader } from "../utils";
import { boxMeta } from "./types";
import "./iso-media-file-format"
import "./mp4"
import "./others"

export type GlobalData = {
    tracks:{
        [trackID:number]:{
            sampleCount:number,
            sampleSizes:number|number[],
            chunkOffsets:number[]
            sampleToChunks:{
                firstChunk:number,
                samplesPerChunk:number
            }[]
        }
    }
    currentTrackID?:number
};

const emptyArrayBuffer = new ArrayBuffer(0)

export interface Box<BoxData=any>{
    type:string,
    size:UInt64|number,
    raw:ArrayBuffer,
    data:BoxData,
    children?:Box[]
}

export function makeParser(){
    const globalData:GlobalData = {
        tracks:{}
    }
    async function parseBox(reader:MediaFileReader):Promise<Box>{
        const {readBytes} = reader
        let largesize = false
        let headerLength = 8
        const maybeSizeAB = await readBytes(4)
        if(!maybeSizeAB)
            return null
        const view = new DataView(maybeSizeAB)
        let size:Box['size'] = view.getUint32(0)
        if(size === 0)
            return null
        if(size === 1)
            largesize = true
        const typeB = await readBytes(4)
        const type = ab2str(typeB)
        if(!type)
            return null
        if(largesize){
            headerLength += 8
            size = makeUInt64BE(await readBytes(8))
        }
        let dataBuffers = []
        const res:Box = {
            size,
            type,
            raw:emptyArrayBuffer,
            data:""
        }
        const meta = boxMeta[type]
        if(!largesize){
            let childrenOffset = 0
            if(meta && meta.children){
                childrenOffset = meta && meta.childrenOffset || 0 // some box's data contains some fields before its children
                if(childrenOffset)
                    res.raw = await readBytes(childrenOffset)
                let pointer = childrenOffset
                const children = await parseBoxes({
                    readBytes:async (requestSize)=>{
                        if(pointer>=+size-headerLength)
                            return null
                        const res = await readBytes(requestSize)
                        console.debug(`parent is ${type}, parent size ${size}, offset is ${pointer}`)
                        pointer = pointer+requestSize
                        return res
                    },
                })
                res.children = children
            }else
                res.raw = await readBytes((size as number) - headerLength)
        }else{
            const sizeP = (size as UInt64).clone()
            throw new Error("Large Size Not Implemented")
            while(sizeP.high >= 0){
                const chunk = await readBytes(sizeP.high === 0?(sizeP.low-headerLength):2147483648)
                dataBuffers.push(chunk)
                sizeP.high -- 
            }
            res.raw = concatArrayBuffers(dataBuffers)
        }
        res.data = meta && meta.data ? meta.data(ArrayBufferReader(res.raw),globalData): res.raw
        return res
    }
    async function parseBoxes(fileReader:MediaFileReader):Promise<Box[]>{
        let results = []
        while(true){
            const box = await parseBox(fileReader)
            if(!box || +box.size === 0)
                break
            results.push(box)
        }
        return results
    }
    return {
        parseBoxes,
        globalData
    }
}