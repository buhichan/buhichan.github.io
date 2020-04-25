import * as React from "react"
import * as ReactDOM from "react-dom"
import MoonphasePlayer from "./moonphase-player/moonphase-player";
import VideoVisualizer from "./visualizer/visualizer";

export default function EmojiPlayer(){
    // if(location.hostname === 'localhost'){
    //     return <VideoVisualizer />
    // }
    const [file,setFile] = React.useState(null as null | File)
    React.useEffect(()=>{
        fetch("assets/big_buck_bunny.webm").then(x=>x.blob() as any).then(setFile)
    },[])
    return <div>
        {
            <input type="file" accept="video/webm" onChange={(e)=>{
                if(!e.currentTarget.files){
                    return
                }
                const file = e.currentTarget.files[0]
                if(file){
                    setFile(file)
                    // let promise
                    // if(file.type.includes('mp4'))
                    //     promise = parseMp4File()
                    // else if(file.type.includes('flv'))
                    //     promise = parseFlvFile()
                    // else
                    //     return
                    // promise.then(this.setState.bind(this))
                }
            }} />
        }
        { file ? <MoonphasePlayer file={file} /> : null }
    </div>
}