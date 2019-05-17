import { ab2str, readUInt16BE, readUInt32BE } from "../utils";
import { MediaFileReader } from "../file-reader";

async function readString(reader:MediaFileReader,longString:boolean){
    let strLength = 0
    if(!longString){
        const buf = await reader.readBytes(2)
        strLength = readUInt16BE(buf)
    }else{
        const buf = await reader.readBytes(4)
        strLength = readUInt32BE(buf)
    }
    if(!strLength)
        return ""
    return ab2str(await reader.readBytes(strLength))
}

export async function readValue(reader:MediaFileReader){
    let valueType = new Uint8Array(await reader.readBytes(1))[0]
    switch(valueType){
        case 0:
            return new DataView(await reader.readBytes(8)).getFloat64(0)
        case 1:
            return new Uint8Array(await reader.readBytes(1))[0]>0?true:false
        case 2:
        case 4:{
            const res = await readString(reader,false)
            if(valueType ===4){
                //todo defining the movie clip path
            }
            return res
        }    
        case 3:
            return await readObjects(reader)
        case 5:
            return null
        case 6:
            return undefined
        case 7:
            return readUInt16BE(await reader.readBytes(2))
        case 8:
            await reader.readBytes(4)
            return await readObjects(reader)
        case 10:{
            let res:any = {}
            let number = readUInt32BE(await reader.readBytes(4))
            while(number-->0){
                const name = await readString(reader,false)
                const value = await readValue(reader)
                res[name]=value
            }
            return res
        }
        case 11:{
            const ms = new DataView(await reader.readBytes(8)).getFloat64(0)
            await reader.readBytes(2)
            // const localDatetimeOffset = new Int16Array(await reader.readBytes(2))[0]
            return new Date(ms)
        }
        case 12:
            return await readString(reader,true)
    }
}

async function readObjects(reader:MediaFileReader){
    const objects:any = {}
    let limit = 100
    while(limit-->0){
        const name = await readString(reader,false)
        if(name.length === 0){ // 0x000009
            const end = await reader.readBytes(1)
            if(new Uint8Array(end)[0] === 9)
                break
            else
                throw new Error("unexpected end")
        }
        const value = await readValue(reader)
        objects[name] = value
    }
    return objects
}