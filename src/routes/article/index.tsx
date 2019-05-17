import * as marked from "marked"
import { usePromise } from "../../services/use-promise";
import * as React from "react"

export default function Article({name}:{name:string}){
    const [text] = usePromise(()=>{
        return fetch("/articles/"+name+".md").then(x=>x.text()).then(text=>{
            return marked(text)
        })
    },[name])
    return <div dangerouslySetInnerHTML={{__html:text}}>
    
    </div>
}