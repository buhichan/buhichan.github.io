import * as React from "react"
import { interval } from "rxjs";
import { map } from "rxjs/operators";
import { useSource } from "rehooker";

const loop$ = interval(1000).pipe(
    map(i=>i % 6 + 1)
)

export default function Fractal(){
    const ref = React.useRef(null as null | HTMLCanvasElement)

    const loop = useSource(loop$) || 0
    
    React.useEffect(()=>{
        if(ref.current){
            const {width:W,height:H} = ref.current.getBoundingClientRect()
            const U = Math.min(W,H)
            ref.current.height = U * 2
            ref.current.width = U * 2
            ref.current.style.height = U + "px"
            ref.current.style.width = U + "px"

            const M = U * Math.pow(3,-1/2)
            const points:Point[] = [
                [U,U/3],
                [U+M,U/3*4],
                [U-M,U/3*4],
            ]
            const path = [
                ...雪花([points[0],points[1]]),
                ...雪花([points[1],points[2]]),
                ...雪花([points[2],points[0]]),
            ]

            const context2d = ref.current.getContext('2d')
            if(context2d){
                // let anime = requestAnimationFrame(function render(){
                    context2d.clearRect(0,0,window.innerWidth,window.innerHeight)
                    context2d.beginPath()
                    context2d.strokeStyle = "#000"
                    context2d.moveTo(...path[0])
                    for(let point of path){
                        context2d.lineTo(...point)
                    }
                    context2d.stroke()
                    // anime = requestAnimationFrame(render)
                // })
                // return ()=>cancelAnimationFrame(anime)
            }
        }
    },[loop])
    return <div>
        <canvas ref={ref} style={{
            width:"100%",
            height:"100%",
            right:0,
            position:"absolute",
        }} />
    </div>
}

type Point = [number,number]

const 雪花 = make雪花(5)

function make雪花(layer:number){
    const rands = [
        [Math.random() * 0.2,Math.random() * 0.3],
        [Math.random() * 0.2 + 0.2,Math.random() * 0.3],
        [Math.random() * 0.2 + 0.4,Math.random() * 0.3],
        [Math.random() * 0.2 + 0.8,Math.random() * 0.3],
    ]
    return function 雪花Inner (line:Point[],curLayer = layer):Point[]{
        if(curLayer === 0){
            return line
        }
        let res:Point[] = []
        let i = 0
        while(i < line.length - 1){
            res.push(line[i])
            let p1 = line[i]
            let p2 = line[i+1]
            for(let j=0;j<rands.length;j++){
                let [k1,k2] = rands[j]
                res.push(
                    pipe(
                        minus(p2),
                        (v1)=>{
                            const v2 = [-v1[1],v1[0]] as Point
                            return add(multi(k1)(v1))(multi(k2)(v2))
                        },
                        add(p1)
                    )(p1)
                )
            }
            i += 1
        }
        res.push(line[line.length - 1])
        return 雪花Inner(res,curLayer - 1)
    }
}

function pipe(...fn:((p:Point)=>Point)[]){
    return (p:Point)=>fn.reduce((p,f)=>f(p),p)
}

function add(v2:Point){
    return (v1:Point)=>[
        v1[0] + v2[0], 
        v1[1] + v2[1]
    ] as Point
}

function multi(v2:number){
    return (v1:Point)=>[
        v1[0] * v2,
        v1[1] * v2
    ] as Point
}

function minus(v2:Point){
    return (v1:Point)=>[
        v2[0] - v1[0], 
        v2[1] - v1[1]
    ] as Point
}

function rotate(rad:number){ //counter-clockwise
    return (v:Point)=>[
        v[0] * Math.cos(rad) - v[1] * Math.sin(rad),
        v[0] * Math.sin(rad) + v[1] * Math.cos(rad),
    ] as Point
}

function between(p2:Point,n:number){
    return (p1:Point)=>[p1[0] * (1-n) + p2[0] * n, p1[1] * (1-n) + p2[1] * n] as Point
}