import { FlvTag } from "../flv-parser/flv-parser";
import * as React from "react"
import { VideoDataFrameType, VideoDataCodecID, AudioDataSoundFormat, AudioDataSoundType, AudioDataSoundRate, AudioDataSoundSize } from "../flv-parser/enums";

export default function FlvRenderer(props:{tags:FlvTag[]}){
    const tags = props.tags
    return <div>
        <ul>
            {
                tags.map((x,i)=>{
                    return <li key={i}>
                        <p>{x.type}</p>
                        <p>size:{x.size}</p>
                        <p>previous tag size:{x.previousTagSize}</p>
                        {
                            (()=>{
                                switch(x.type){
                                    case "audio":{
                                        return <div>
                                            <p>soundFormat:{AudioDataSoundFormat[x.data.soundFormat]}</p>
                                            <p>soundType:{AudioDataSoundType[x.data.soundType]}</p>
                                            <p>soundSize:{AudioDataSoundSize[x.data.soundSize]}</p>
                                            <p>codecID:{AudioDataSoundRate[x.data.soundRate]}</p>
                                        </div>
                                    }
                                    case "video":{
                                        return <div>
                                            <p>frameType:{VideoDataFrameType[x.data.frameType]}</p>
                                            <p>codecID:{VideoDataCodecID[x.data.codecID]}</p>
                                        </div>
                                    }
                                    case "script":{
                                        return <pre>
                                            {`${x.data.method}(${JSON.stringify(x.data.args,null,"\t")})`}
                                        </pre>
                                    }
                                }
                            })()
                        }
                    </li>
                })
            }
        </ul>
    </div>
}