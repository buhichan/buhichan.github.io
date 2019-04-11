

export type MediaFileReader = ReturnType<typeof mediaFileReader>

export function mediaFileReader(file:Blob){
    let remaining:ArrayBuffer
    let queue:{resolve:Function,size:number}[] = []
    let closed = false
    const reader = new FileReader()
    reader.readAsArrayBuffer(file)
    reader.addEventListener("load", function () {
        remaining = reader.result as ArrayBuffer
        closed=true
        consume()
    }, false);

    function consume(){
        while(queue.length>0){
            const {resolve,size} = queue[0]
            if(size <= remaining.byteLength){
                let actualSize = size === 0 ? Infinity : size
                let slice = remaining.slice(0,actualSize)
                remaining = remaining.slice(actualSize)
                queue.shift()
                resolve(slice)
            }else
                break
        }
    }

    function readBytes(size:number):Promise<ArrayBuffer>{
        if(remaining && remaining.byteLength >= size){
            let slice = remaining.slice(0,size)
            remaining = remaining.slice(size)
            return Promise.resolve(slice)
        }else if(!closed){
            return new Promise(resolve=>{
                queue.push({
                    resolve,
                    size
                })
            })
        }else
            return Promise.resolve(emptyArrayBuffer)
    }

    return {
        readBytes
    }
}

const emptyArrayBuffer = new ArrayBuffer(0)