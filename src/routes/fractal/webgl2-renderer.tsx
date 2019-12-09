import * as React from "react"
import { createWebgl2Program, AttrType } from "./webgl2-program";
import { usePromise } from "../../services/use-promise";
import {mat4} from "gl-matrix"

// import "webgl2"
///<reference path="../../../node_modules/@types/webgl2/index.d.ts" />

type Props = {

}

const shaders = [
    "mandelbrot-set" as const,
    "julia-set" as const,
    // "candle-flame" as const,
]

const vertexShader = `#version 300 es
precision highp float;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
in vec3 position;
in vec2 uv;
out vec3 vPos;
out vec2 vUv;

void main(){
    vPos = position;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const HEIGHT = 1400
const WIDTH = 1400

export default function WebglRenderer (props:Props){

    const canvasRef = React.useRef()

    const coordinateDisplayRef = React.useRef<HTMLSpanElement>()

    const [fsName,setFsName] = React.useState(()=>{
        const urlSearch = new URLSearchParams(location.search)
        return urlSearch.get("shader") || shaders[0]
    })

    const [fragmentShader] = usePromise(()=>{
        return import("./shaders/"+fsName+".glsl").then(res=>{
            return res.default
        })
    },[fsName])

    const state = React.useMemo(()=>({
        zoom:1,
        translate: [0,0],
        paused: false,
        mouse: [0,0],
    }),[])

    React.useEffect(()=>{
        const canvas = canvasRef.current as HTMLCanvasElement

        canvas.addEventListener("wheel",(e)=>{
            e.preventDefault()
            e.stopPropagation()
            if(e.ctrlKey){
                const offsetX = e.offsetX * devicePixelRatio
                const offsetY = HEIGHT - e.offsetY * devicePixelRatio
                const factor = ( 100 + e.deltaY ) / 100 
                state.translate[0] = (state.translate[0] + offsetX) / factor - offsetX
                state.translate[1] = (state.translate[1] + offsetY) / factor - offsetY
                state.zoom *= factor
            }else{
                state.translate[0] += e.deltaX 
                state.translate[1] -= e.deltaY 
            }
        })

        canvas.addEventListener("click",()=>{
            state.paused = !state.paused
        })

        canvas.addEventListener("mousemove",(e)=>{
            const offsetX = e.offsetX * devicePixelRatio
            const offsetY = HEIGHT - e.offsetY * devicePixelRatio
            const x =  (offsetX + state.translate[0]) / WIDTH * state.zoom * 2.0 - 1.0;
            const y =  (offsetY + state.translate[1]) / HEIGHT * state.zoom * 2.0 - 1.0;
            state.mouse[0] = x
            state.mouse[1] = y
            coordinateDisplayRef && coordinateDisplayRef.current && (coordinateDisplayRef.current.innerHTML = `${x.toLocaleString('zh-CN',{
                maximumFractionDigits:2,
                minimumFractionDigits:2,
            })},${y.toLocaleString('zh-CN',{
                maximumFractionDigits:2,
                minimumFractionDigits:2,
            })}`)
        })
    },[])

    React.useEffect(()=>{
        const canvas = canvasRef.current as HTMLCanvasElement
        if(!fragmentShader){
            return undefined
        }
        if(canvas){

            const glattr = {
                alpha:true,
                depth:true,
                antialias:true,
                premultipliedAlpha:false,
                devicePixelRatio: window.devicePixelRatio,
            } as WebGLContextAttributes

            let gl = canvas.getContext("webgl2",glattr) as WebGL2RenderingContext

            if(!gl){
                gl = canvas.getContext("experimental-webgl2",glattr) as WebGL2RenderingContext
            }

            // const xSegments = Math.floor(WIDTH / 100)
            // const ySegments = Math.floor(HEIGHT / 100)
            const xSegments = 1
            const ySegments = 1

            const vertexNumber = (xSegments + 1) * (ySegments + 1);

            /**
             * @property position vec3  3
             * @property uv vec2  2
             */
            const vboDataStride = 3 + 2
            const vboData = new Float32Array(vertexNumber * vboDataStride);

            for(let j=0;j <= ySegments; j++){
                for(let i=0; i <= xSegments ; i++){
                    let offset = (j*(xSegments+1) + i) * vboDataStride
                    vboData[offset]       = i
                    vboData[offset + 1]   = j
                    vboData[offset + 2]   = 1
                    vboData[offset + 3]   = i / xSegments
                    vboData[offset + 4]   = j / ySegments
                }
            }

            const elementArray =  makePlaneGeometryEBO(xSegments, ySegments)

            // const projectionMatrix = mat4.create()
            // const viewMatrix = mat4.create()
            // const modelMatrix = mat4.create()
            // const modelViewMatrix = mat4.create()
            // mat4.perspective(projectionMatrix, Math.acos(WIDTH/HEIGHT)/2, WIDTH/HEIGHT, 0.1, 1000)
            // mat4.lookAt(viewMatrix, [0,0,100], [0,0,0], [0,0,1])
            // mat4.fromTranslation(modelMatrix, [50,50,100])
            // mat4.multiply(modelViewMatrix, modelMatrix, viewMatrix)

            const program = createWebgl2Program({
                gl,
                vsSource:vertexShader,
                fsSource:fragmentShader,
                vboData,
                uniforms:{
                    projectionMatrix:[
                        2/xSegments, 0, 0, -1,
                        0, 2/ySegments, 0, -1,
                        0, 0, 1, -0.5,
                        0, 0, 0, 1
                    ],
                    modelViewMatrix:[
                        1, 0, 0, 0,
                        0, 1, 0, 0,
                        0, 0, 1, 0,
                        0, 0, 0, 1
                    ],
                    resolution: [WIDTH,HEIGHT],
                    time: 0,
                    params:  params,
                    zoom: state.zoom,
                    translate: state.translate,
                    mouse:state.mouse,
                },
                attributes:{
                    position:{
                        type: AttrType.float,
                        size: 3,
                        stride: vboDataStride * Float32Array.BYTES_PER_ELEMENT,
                        offset: 0,
                    },
                    uv:{
                        type: AttrType.float,
                        size: 2,
                        stride: vboDataStride * Float32Array.BYTES_PER_ELEMENT,
                        offset: Float32Array.BYTES_PER_ELEMENT * 3,
                    }
                },
                eboData: elementArray,
            })


            let lastRenderTime = 0
            let totalPauseTime = 0

            program.bind()

            let isFirstLoop = true

            function loop(timeValue){
                program.uniforms.translate = state.translate
                program.uniforms.zoom = state.zoom
                program.uniforms.params = params
                let time = timeValue - totalPauseTime
                program.uniforms.time = time
                // program.uniforms.projectionMatrix = projectionMatrix
                if(state.paused){
                    totalPauseTime += timeValue - lastRenderTime
                }else{
                    program.uniforms.mouse = state.mouse
                }
                lastRenderTime = timeValue
                program.draw(gl.TRIANGLES)
                if(isFirstLoop){
                    const buf = new Uint8Array(4)
                    gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,buf)
                    console.log([...buf])
                    isFirstLoop = false
                }
                animeHandle = requestAnimationFrame(loop)
            }
            let animeHandle = requestAnimationFrame(loop)

            return ()=>{
                cancelAnimationFrame(animeHandle)
                program.unbind()
            }
        }
    },[fragmentShader])

    const params = React.useMemo(()=>[1,0,0],[])

    const [magicNumberState,setMagicNumberState] = React.useState(params)

    return <div style={{display:"flex",justifyContent:"space-between", alignItems:"flex-start"}}>
        <div>
            <p>raw webgl2</p>
            <div onChange={(e)=>{
                const value = (e.target as HTMLInputElement).value
                setFsName(value as any)
                const newURL = new URL(location.href)
                newURL.search = "?shader="+value
                history.pushState(null,document.title,newURL.href)
            }}>
                <h4>shaders</h4>
                {
                    shaders.map(x=>{
                        return <label key={x}>
                            <input defaultChecked={fsName === x} type='radio' key={x} name="fsName" value={x} />
                            {x}
                        </label>
                    })
                }
            </div>
            <div>
                <h4>params</h4>
                {
                    params.map((x,i)=>{
                        return <label style={{display:"block"}} key={i}>
                            <span style={{marginRight:2}}>{['x','y','z'][i]}</span>
                            <input type="range" value={String(magicNumberState[i])} max={500} min={0} step={1} onChange={(e)=>{
                                params[i] = e.currentTarget.valueAsNumber
                                setMagicNumberState([...params])
                            }}/>
                            <input type="number" value={String(magicNumberState[i])} max={500} min={0} step={1}  onChange={(e)=>{
                                params[i] = e.currentTarget.valueAsNumber
                                setMagicNumberState([...params])
                            }}/>
                        </label>
                    })
                }
            </div>    
            <div>
                <p>mouse is currently at (<span ref={coordinateDisplayRef}></span>)</p>
            </div>    
            <details open>
                <summary>
                    show code
                </summary>
                <pre>{fragmentShader}</pre>
            </details>
        </div>
        <canvas style={{
            // position:'absolute',
            // background:"red",
            top:0,
        }} height={HEIGHT / devicePixelRatio} width={WIDTH / devicePixelRatio} ref={canvasRef} />
    </div>
}

function makePlaneGeometryEBO(xSegments:number, ySegments:number){
    let index = new Uint8Array(xSegments * ySegments * 6)
    let rowSize = xSegments + 1;
    let rowCount = ySegments + 1;
    for(let y=0;y<rowCount - 1;y++){
        for(let x=0;x<rowSize - 1;x++){
            const i = y * rowSize + x
            /**
             *  i+rowSize   i+rowSize+1
             *  i           i+1
             */
            index.set([
                i,              i+1,         i+rowSize+1,   
                i+rowSize+1,    i+rowSize,   i,
            ], (i - y) * 6)
        }
    }
    return index
}