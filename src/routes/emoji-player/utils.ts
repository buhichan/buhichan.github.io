// const {getFloat16} = require("@petamoriken/float16")

declare const float16:any

export function concatArrayBuffers(buffers:ArrayBuffer[]) {
    const buffersLengths = buffers.map(function(b) { return b.byteLength; })
    const totalBufferlength = buffersLengths.reduce(function(p, c) { return p+c; }, 0)
    const unit8Arr = new Uint8Array(totalBufferlength);
    buffersLengths.reduce(function (p, c, i) {
        unit8Arr.set(new Uint8Array(buffers[i]), p);
        return p+c;
    }, 0);
    return unit8Arr.buffer;
}

export type UInt64 = ReturnType<typeof makeUInt64BE>

export function readUInt16BE(buf:ArrayBuffer){
    const arr = new Uint8Array(buf)
    return (arr[0] << 8) + arr[1]
}

export function readUInt24BE(buf:ArrayBuffer){
    const arr = new Uint8Array(buf)
    return (arr[0] << 16) + (arr[1] << 8) + arr[2]
}

export function readUInt32BE(buf:ArrayBuffer){
    const arr = new Uint8Array(buf)
    return (arr[0] << 24) + (arr[1] << 16) + (arr[2] << 8) + arr[3]
}

export function makeUInt64BE(int:ArrayBuffer){
    const arr = new DataView(int)
    let high = arr.getUint32(0)
    let low = arr.getUint32(4)
    return {
        [Symbol.toPrimitive](type:"number"){
            if(high!==0)
                return NaN
            return low
        },
        set high(v){
            high = v
        },
        get high(){
            return high
        },
        set low(v){
            low = v
        },
        get low(){
            return low
        },
        clone(){
            return makeUInt64BE(int)
        }
    }
}

export function uint8arr2str(buf:Uint8Array){
    let res = ""
    for(let char of buf){
        res += char.toString(16)
    }
    return res
}

export function ab2str(buf:ArrayBuffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buf))
}

const emptyArrayBuffer = new ArrayBuffer(0)
export type ReaderInstance = ReturnType<typeof ArrayBufferReader>
export function ArrayBufferReader(buffer:ArrayBuffer|null){
    const view = new DataView(buffer || emptyArrayBuffer)
    let byteOffset = 0
    return {
        get byteLength(){
            return view.byteLength
        },
        get buffer(){
            return view.buffer
        },
        get byteOffset(){
            return byteOffset
        },
        getInt64(){
            byteOffset += 4
            const res = view.getInt32(byteOffset)
            byteOffset += 4
            return res
        },
        getInt32(){
            const res = view.getInt32(byteOffset)
            byteOffset += 4
            return res
        },
        getUint32(){
            const res = view.getUint32(byteOffset)
            byteOffset += 4
            return res
        },
        getUint16(){
            const res = view.getUint16(byteOffset)
            byteOffset += 2
            return res
        },
        getUint8(){
            const res = view.getUint8(byteOffset)
            byteOffset += 1
            return res
        },
        getUint64(){
            byteOffset += 4
            const res = view.getUint32(byteOffset)
            byteOffset += 4
            return res
        },
        getFloat16(){
            const res = float16.getFloat16(view,byteOffset)
            byteOffset += 2
            return res
        },
        getFloat32(){
            const res = view.getFloat32(byteOffset)
            byteOffset += 4
            return res
        },
        skip(bytes:number){
            byteOffset += bytes
            return true
        },
        goTo(bytes:number){
            byteOffset = bytes
            return true
        },
        getUnicodeString(){
            let start = byteOffset
            while(true){
                const char = view.buffer[byteOffset++]
                if(char === undefined || char === 0)
                    break
            }
            return new TextDecoder("utf-8").decode(view.buffer.slice(start,byteOffset))
        },
        getString(){
            let string = ""
            while(true){
                const char = view.buffer[byteOffset++]
                if(char === undefined || char === 0)
                    break
                string += String.fromCharCode(char)
            }
            return string
        },
        get(length:number){
            const res = view.buffer.slice(byteOffset,byteOffset+length)
            byteOffset += length
            return res
        }
    }
}

const daysecs = 3600*24
const offset = Math.floor((1970-1904)/4) * daysecs + (1970-1904)*365*daysecs
export function timestamp1904(ts:number){
    return new Date((ts - offset) * 1000).toLocaleString()
}

export function hex(num:number){
    return 
}
