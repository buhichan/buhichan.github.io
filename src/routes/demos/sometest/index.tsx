import * as React from "react"

export default function SomeTest(){

    const [text,setText] = React.useState("")

    React.useEffect(()=>{
        const onResize = ()=>{
            setText(`window.innerWidth: ${window.innerWidth}\n document.body.clientHeight: ${document.body.clientHeight}`)
        }
        window.addEventListener("resize",onResize)
        return ()=>{
            window.removeEventListener("resize", onResize)
        }
    },[])

    return <div>
        <pre>Info: {text}</pre>
        <div contentEditable>
            114514
        </div>
    </div>
}