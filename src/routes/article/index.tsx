import * as marked from "marked"
import { usePromise } from "../../services/use-promise";
import * as React from "react"
import { useSearchParams, Anchor } from "../../services/router";
import { ArticleList } from "./article-list";

export default function Article(){
    const params = useSearchParams()
    const name = params.get("article")
    const [text] = usePromise(async ()=>{
        if(!name){
            return null
        }
        return marked( await fetch("/articles/"+name+".md").then(x=>x.text()))
    },[name])
    if(!text){
        return <div>
            {
                Object.keys(ArticleList).map(x=>{
                    return <li key={x}><Anchor href={"/article?article="+x}>{ArticleList[x]}</Anchor></li>
                })
            }
        </div>
    }
    return <div dangerouslySetInnerHTML={{__html:text}}>
    
    </div>
}