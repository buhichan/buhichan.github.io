
enum NodeType {
    uint8,
    uint16,
    uint24,
    uint32,
    uint64,
    variant,
}

const NotEnoughInput = new Error("Not Enough Input")

class ParserNode{
    constructor(public name:string){}
    public byteLength
    size(size:number){
        this.byteLength = size
        return this
    }
    type(type:NodeType){
        return this
    }
    parse(reader:ArrayBuffer,offset:number){
        if(reader.byteLength - offset < this.byteLength){
            throw NotEnoughInput
        }else{
            const dv = 1
        }
    }
}

export function createParser(){
    const n = (name:string)=>{
        return new ParserNode(name)
    }

    return {
        next(bytes:ArrayBuffer){

        }
    }
}