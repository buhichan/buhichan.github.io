import { MDatViewer } from "./mdat-viewer";
import * as React from "react"

function renderMatrix(m:number[]){
    return <table>
        <tbody>
            <tr><td>{m[0]>>16}</td><td>{m[1]>>16}</td><td>{m[2]>>16}</td></tr>
            <tr><td>{m[3]>>16}</td><td>{m[4]>>16}</td><td>{m[5]>>16}</td></tr>
            <tr><td>{m[6]>>16}</td><td>{m[7]>>16}</td><td>{m[8]>>16}</td></tr>
        </tbody>
    </table>
}

function renderList(data:any[]){
    return <ul style={{maxHeight:200,overflow:"auto"}}>
        {
            data.map((x,i)=><li key={i}>
                {renderValue(x)}
            </li>)
        }
    </ul>
}

function renderValue(value:any){
    if(value instanceof Array)
        if(value[Symbol.for("isMatrix")])
            return renderMatrix(value)
        else
            return renderList(value)
    else if(typeof value === 'object')
        return renderIndexedMap(value)
    else
        return String(value)
}

function renderIndexedMap(desc){
    return <table>
        <tbody>
            {Object.keys(desc).map(x=>{
                
                return <tr key={x}><td>{x}</td><td>{renderValue(desc[x])}</td></tr>
            })}
        </tbody>
    </table>
}

export function BoxRenderer({type,data,globalData}){
    if(type === 'mdat')
        return <MDatViewer reader={data} globalData={globalData} />
    else 
        return <>{renderValue(data)}</>
}