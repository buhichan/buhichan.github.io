import { ReaderInstance } from "../utils";
import { GlobalData } from "./mp4-parser";

export function getCurrentTrackInfo(context:GlobalData){
    if(!context.currentTrackID){
        return null
    }
    if(!context.tracks[context.currentTrackID])
        context.tracks[context.currentTrackID] = {
            sampleCount:0,
            sampleSizes:0,
            chunkOffsets:[],
            sampleToChunks:[]
        }
    return context.tracks[context.currentTrackID]
}

export function repeat<T>(times:number,cb:(i:number)=>T):T[]{
    const res = []
    for(let i=0;i<times;i++)
        res.push(cb(i))
    return res
}

export function readMatrix(r:ReaderInstance){
    const m = [
        r.getUint32(),r.getUint32(),r.getUint32(),
        r.getUint32(),r.getUint32(),r.getUint32(),
        r.getUint32(),r.getUint32(),r.getUint32(),
    ];
    (m as any)[Symbol.for("isMatrix")] = true
    return m
}

// export function readESDescriptor(r:DataViewReaderInstance){
//     const length = r.getUint8()
//     const ES_ID = r.getUint16()
//     const flags= r.getUint8() 
//     const streamDependenceFlag = flags & 0b1000000
//     const URL_Flag = flags & 0b01000000
//     const streamPriority = flags & 0b00011111
//     return renderIndexedMap({
//         length,
//         ES_ID,
//         streamDependenceFlag,
//         URL_Flag,
//         streamPriority,
//         dependsOn_ES_ID: streamDependenceFlag ? r.getUint16() :"",
//         URLstring: ab2str(r.get(8))
//     })
// }