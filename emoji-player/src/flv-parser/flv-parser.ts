import { MediaFileReader } from "../file-reader";
import { readUInt24BE } from "../utils";
import { readValue } from "./object-tag-parser";

type AudioData = {
    soundFormat:number
    soundRate:number
    soundSize:number
    soundType:number
    data:ArrayBuffer
}

type VideoData = {
    frameType:number,
    codecID:number,
    data:ArrayBuffer
}

type ScriptData = {
    method:string
    args:{
        [name:string]:any
    }
}

interface FlvTagBase {
    type:string
    size:number,
    timestamp:number
    streamID:number,
    data:any,
    previousTagSize:number
}

interface FlvAudioTag extends FlvTagBase {
    type:"audio"
    data:AudioData
}

interface FlvVideoTag extends FlvTagBase {
    type:"video"
    data:VideoData
}

interface FlvScriptTag extends FlvTagBase {
    type:"script"
    data:ScriptData
}

export type FlvTag = FlvAudioTag | FlvVideoTag | FlvScriptTag

export async function parseFlv(reader:MediaFileReader){
    const header = await reader.readBytes(9)
    const headerLength = new DataView(header).getUint32(5)
    await reader.readBytes(headerLength-9)
    const result = []
    while(true){
        let tag:Partial<FlvTag> = {}
        tag.previousTagSize = new DataView(await reader.readBytes(4)).getUint32(0) // previous tag size, not used
        const maybeTagType = await reader.readBytes(1)
        if(!maybeTagType)
            break
        const tagType = new Uint8Array(maybeTagType)[0]
        tag.type = tagType === 8 ? "audio" : tagType === 9 ? "video" : tagType === 18? "script" : null
        tag.size = readUInt24BE(await reader.readBytes(3))
        const timestampLow = readUInt24BE(await reader.readBytes(3))
        const timestampHigh = await reader.readBytes(1)
        tag.timestamp = timestampLow + (new Uint8Array(timestampHigh)[0] << 24)
        tag.streamID = readUInt24BE(await reader.readBytes(3))
        switch(tag.type){
            case "audio":{
                let data:Partial<AudioData> = {}
                const flags = new Uint8Array(await reader.readBytes(1))[0]
                data.soundFormat = flags >> 4
                data.soundRate = (flags >> 2) % 0b100
                data.soundSize = (flags >> 1) % 0b10
                data.soundType = (flags) % 0b10
                data.data = await reader.readBytes(tag.size-1)
                tag.data = data as AudioData
                break
            }
            case "video":{
                let data:Partial<VideoData> = {}
                const flags = new Uint8Array(await reader.readBytes(1))[0]
                data.frameType = flags >> 4
                data.codecID = flags % 0b10000
                data.data = await reader.readBytes(tag.size-1)
                tag.data = data as VideoData
                break
            }
            case "script":{
                let data:Partial<ScriptData> = {}
                data.method = await readValue(reader)
                data.args = await readValue(reader)
                tag.data = data as ScriptData
                break
            }
        }
        result.push(tag)
    }
    return result
}