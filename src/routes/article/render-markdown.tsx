import * as React from "react"
import * as marked from "marked"

type Props = {
    src: string,
}

export default function RenderMarkdown ({src}:Props){
    const [rendered, setRendered] = React.useState("")
    React.useEffect(()=>{
        if(!!src){
            setRendered(marked(src))
        }
    },[src])
    return <div dangerouslySetInnerHTML={{__html:rendered}}>
    
    </div>
}