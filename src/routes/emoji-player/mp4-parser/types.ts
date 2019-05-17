import { ReaderInstance } from "../utils";

type BoxDescription<GlobalContext={},BoxData={}> = {
    name:string,
    desc:string,
    extends?:string,
    container?:string[],
    children?:Set<string>,
    childrenOffset?:number,
    data?:(data:ReaderInstance,globalContext:GlobalContext)=>BoxData,
}

export const boxMeta:{
    [type:string]:BoxDescription
} = {}

export function describeType<Context={}>(typeName:string,desc:BoxDescription<Context>){
    if(desc.container){
        desc.container.map(x=>{
            if(!boxMeta[x])
                boxMeta[x] = {} as any
            if(!boxMeta[x].children)
                boxMeta[x].children = new Set()
            boxMeta[x].children.add(x)
        })
    }
    if(!desc.data)
        desc.data = r=>r.getString()
    boxMeta[typeName] = {
        ...boxMeta[typeName],
        ...desc
    }
    if(desc.extends){
        const extended = boxMeta[desc.extends]
        if(!extended)
            return
        const childData = boxMeta[typeName].data
        boxMeta[typeName].data = (r,g)=>{
            return {
                ...extended.data(r,g),
                ...childData && childData(r,g) || {}
            }
        }
    }
}

export function describeAbstract(typeName:string,desc:BoxDescription){
    describeType(typeName, desc)
}