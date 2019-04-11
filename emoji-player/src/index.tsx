import * as React from "react"
import * as ReactDOM from "react-dom"
import Visualizer from "./visualizer/visualizer";

export function Init(){
    ReactDOM.render(<div>
        <Visualizer />
    </div>,document.getElementById('root'))
}


Init()