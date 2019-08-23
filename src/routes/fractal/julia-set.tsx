import * as React from "react"
import * as th from "three"
import { fromEvent } from "rxjs";
import {makeTimer} from "../../services/timer"

const vertexShader = `
varying vec2 vUv;

void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

`

const fragmentShader = `
uniform float iTime;
varying vec2 vUv;

const int maxIteration = 50;    
const float maxIterationFloat = 50.0;

const float limit = 32.0;

const float magicConstant = 0.618;

vec3 hsb2rgb( in vec3 c ){
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                             6.0)-3.0)-1.0,
                     0.0,
                     1.0 );
    rgb = rgb*rgb*(3.0-2.0*rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
}

vec3 juliaSet(vec2 coord, vec2 c){
    vec2 z = vec2( coord.x - 0.5, coord.y - 0.5) * 5.0;
    float l = 0.0;
    float loop = 0.0;
    for(int i=0; i<maxIteration; i++){
        z = vec2(z.x * z.x - z.y * z.y , z.x * z.y * 2.0) + c;
        l = length(z);
        loop += 1.0;
        if(l > limit){
            break;
        }
    }
    float x = log( log(l) / log(2.0) / loop ) / log(2.0);
    return hsb2rgb(vec3( x , ( step(l,limit) + step(l,limit * 2.0) ) / 2.0, 1.0 ));
}

vec4 getColor(vec2 coord){
    vec2 c = magicConstant * vec2(cos(iTime / 2000.0),sin(iTime / 2000.0));
    //vec2 c = vec2(x,y);
    vec3 res = juliaSet(coord,c);
    return vec4( res, 1.0);
}

void main(){
    gl_FragColor = getColor(vUv);
}

`

export default function JuliaSet(){
    const canvasRef = React.useRef()

    React.useEffect(()=>{
        if(canvasRef.current){
            const canvas = canvasRef.current as HTMLCanvasElement
            const {width,height} = canvas.parentElement.getBoundingClientRect()
            const U = width
            canvas.height = U
            canvas.width = U
            canvas.style.height = U + "px"
            canvas.style.width = U + "px"
            const renderer = new th.WebGLRenderer({
                canvas,
                antialias:true,
            })
            renderer.setPixelRatio(window.devicePixelRatio)
            renderer.debug.checkShaderErrors = true
            const scene = new th.Scene()
            scene.background = new th.Color(0xffffff);
            const camera = new th.PerspectiveCamera(45, 1, 1e-16, U * 4)
            scene.add(camera)
            camera.position.set(0,0,U * 2)
            camera.lookAt(0,0,0)
            const material = new th.ShaderMaterial({
                fragmentShader,
                vertexShader,
                side:th.DoubleSide,
                uniforms:{
                    iTime:{
                        type:"f",
                        value:0,
                    }
                }
            })
            const plane = new th.Mesh(
                new th.PlaneGeometry(U * 2, U * 2),
                material
            )
            plane.lookAt(camera.position)
            scene.add(plane)
            const timer = makeTimer(canvas)
            const render = ()=>{
                timer.update()
                renderer.render(scene,camera)
                material.uniforms.iTime.value = timer.getTime()
                anime = requestAnimationFrame(render)
            }
            let anime:number
            const transformSub = fromEvent(canvas,'mousewheel').subscribe((e:WheelEvent)=>{
                e.stopPropagation()
                e.preventDefault()
                if(e.ctrlKey){
                    camera.position.z *= (100 + e.deltaY) / 100
                }else{
                    camera.position.x += e.deltaX * camera.position.z / 100
                    camera.position.y -= e.deltaY * camera.position.z / 100
                }
            })
            render()
            return ()=>{
                if(anime){
                    cancelAnimationFrame(anime)
                }
                timer.unsubscribe()
                transformSub.unsubscribe()
            }
        }
    },[canvasRef.current])

    return  <>
        <p>用glsl画的julia set</p>
        <p>
            TODO: 怎么支持无限放大呢
        </p>
        <canvas ref={canvasRef} style={{display:"block"}} />
    </>
}