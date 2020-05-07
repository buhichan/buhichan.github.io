import * as React from "react"

export default function SomeTest(){

    const [text,setText] = React.useState("")

    const divRef = React.useRef(null)

    React.useEffect(()=>{
        const onFocus = ()=>{
            setText(`window.innerWidth: ${window.innerWidth}\n document.body.clientHeight: ${document.body.clientHeight} \n `)
        }
        const el = divRef.current as HTMLDivElement
        el.addEventListener("focus",onFocus)
        return ()=>{
            el.removeEventListener("focus", onFocus)
        }
    },[])

    return <div>
        <pre>Info: {text}</pre>
        <pre >
            <code contentEditable ref={divRef}>
                114514
            </code>
        </pre>
    </div>
}