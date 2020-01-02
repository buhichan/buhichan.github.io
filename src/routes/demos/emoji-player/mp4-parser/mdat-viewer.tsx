import * as React from "react"
import { ReaderInstance, ab2str } from "../utils";
import { GlobalData } from "./mp4-parser";

const padLeft = str=>str.length<2?("0"+str):str

export class MDatViewer extends React.PureComponent<{globalData:GlobalData,reader:ReaderInstance}>{
    state={
        expanded:false,
        mode:"hex"
    }
    toggleMode=()=>this.setState({
        mode:this.state.mode==="hex"?"text":"hex"
    })
    render(){
        const {globalData,reader} = this.props
        let mdatStartingPoint = Math.min(...Object.keys(globalData.tracks).map(trackId=>globalData.tracks[trackId].chunkOffsets[0])) // the offsets is offset from file start, not from mdat box start.
        return <div>
            {
                Object.keys(globalData.tracks).map(trackId=>{
                    const trackInfo = globalData.tracks[trackId]
                    return <div key={trackId} >
                        <p>Start From: {trackInfo.chunkOffsets[0].toString(16)}</p>
                        <button onClick={this.toggleMode}>Show hex/text</button>
                        <ul style={{maxHeight:200,marginTop:30,overflow:"auto"}}>
                            {
                                trackInfo.chunkOffsets.map((offset,i)=>{
                                    reader.goTo(offset-mdatStartingPoint)
                                    const sampleSize = trackInfo.sampleSizes instanceof Array? trackInfo.sampleSizes[i]:trackInfo.sampleSizes
                                    const content = reader.get(sampleSize)
                                    return <li key={i}>{
                                        this.state.mode==='hex'?Array.from(new Uint8Array(content)).map(x=>x.toString(16)).map(padLeft).join(" ")
                                        :ab2str(content)
                                    }</li>
                                })
                            }
                        </ul>
                    </div>
                })
            }
        </div>
    }
}