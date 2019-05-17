import * as React from "react"
import { boxMeta } from "../mp4-parser/types";
import { BoxRenderer } from "../mp4-parser/box-renderer";
import { GlobalData, Box } from "../mp4-parser/mp4-parser";

class BoxList extends React.PureComponent<{type:string,boxes:Box[],globalData:GlobalData}>{
    state={
        showChildren:localStorage[this.props.type] === '1'
    }
    toggle=()=>{
        this.setState({showChildren:!this.state.showChildren},()=>{
            localStorage[this.props.type]=this.state.showChildren?'1':'0'
        })
    }
    render(){
        const {boxes,globalData} = this.props
        const {showChildren} = this.state
        return <>
            <button onClick={this.toggle} style={{boxShadow:"none",borderRadius:"50%",background:"#000",color:"#fff"}}>{showChildren?"-":"+"}</button>
            <ul>
                {
                    !showChildren?null:boxes.map((x,i)=>{
                        const meta = boxMeta[x.type]
                        return <li key={i}>
                            <p>{x.type}({x.size})</p>
                            {meta?<div>
                                <p>
                                    <span style={{color:"#333"}}>{meta.name}</span>:<span style={{color:"#888",marginLeft:15}}>{meta.desc}</span>
                                </p>
                                <BoxRenderer type={x.type} data={x.data} globalData={globalData} />
                            </div>:null}
                            <div>
                                {x.children?<BoxList type={x.type} boxes={x.children} globalData={globalData}/>:null}
                            </div>
                        </li>
                    })
                }
            </ul>
        </>
    }
}

export default function Mp4Renderer(props:{boxes:Box[],globalData:GlobalData}){
    const {boxes,globalData} = props
    return <BoxList type={'file'} boxes={boxes} globalData={globalData} />
}