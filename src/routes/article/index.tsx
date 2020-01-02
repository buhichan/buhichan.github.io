import * as marked from "marked"
import { usePromise } from "../../services/use-promise";
import * as React from "react"
import { useSearchParams, Anchor } from "../../services/router";
import { ArticleList } from "./article-list";
import RenderMarkdown from "./render-markdown"

export default function Article(){
    const params = useSearchParams()
    const name = params.get("article")
    const [markdown] = usePromise(async ()=>{
        if(!name){
            return ""
        }
        return fetch("/articles/"+name+".md").then(x=>x.text())
    },[name])
    if(!markdown){
        return <div>
            {
                Object.keys(ArticleList).map(x=>{
                    return <li key={x}><Anchor href={"/article?article="+x}>{ArticleList[x]}</Anchor></li>
                })
            }
        </div>
    }
    return <RenderMarkdown src={markdown} />
}