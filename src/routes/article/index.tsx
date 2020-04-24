import * as marked from "marked"
import { usePromise } from "../../services/use-promise";
import * as React from "react"
import { useSearchParams, Anchor } from "../../services/router";
import RenderMarkdown from "./render-markdown"
import { renderArticles } from "./article-list";

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
        return renderArticles()
    }
    return <RenderMarkdown src={markdown} />
}