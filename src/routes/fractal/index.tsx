import * as React from "react"
import { interval } from "rxjs";
import { map } from "rxjs/operators";

export default function Fractal(){
    const ref = React.useRef(null as null | HTMLCanvasElement)

    const [rands,setRands] = React.useState(()=>{
        return [
            [Math.random() * 0.4,Math.random() * 0.4],
            [Math.random() * 0.4 + 0.2,Math.random() * 0.4],
            [Math.random() * 0.4 + 0.4,Math.random() * 0.4],
            [Math.random() * 0.4 + 0.8,Math.random() * 0.4],
        ] as Point[]
    })

    const [edge,setEdge] = React.useState(3)

    const [loop,setLoop] = React.useState(3)


    React.useEffect(()=>{
        if(ref.current){
            const {width:W,height:H} = ref.current.parentElement.getBoundingClientRect()
            const U = Math.min(W,H)
            ref.current.height = U * 2
            ref.current.width = U * 2

            if(edge < 3){
                return 
            }
            if(loop < 0){
                return
            }

            const 雪花 = makeFractal(rands,loop)

            const points:Point[] = new Array(edge).fill(0).map((_,i)=>{
                return [
                    Math.cos(Math.PI * 2 / edge * i) * U / 2,
                    Math.sin(Math.PI * 2 / edge * i) * U / 2 ,
                ]
            })
            
            const path = points.reduce((path,x,i)=>[
                ...path,
                ...雪花([points[i],i === points.length - 1 ? points[0] : points[i+1]]),
            ],[] as Point[])

            const context2d = ref.current.getContext('2d')
            if(context2d){
                // let anime = requestAnimationFrame(function render(){
                    context2d.clearRect(0,0,window.innerWidth,window.innerHeight)
                    context2d.beginPath()
                    context2d.translate(U,U)
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
    },[loop,edge,rands])


    return <div>
        <canvas ref={ref} style={{
            width:600,
            height:600,
            position:"absolute",
            top:0,
            right:0,
            zIndex:-1
        }} />
        <div>
            <label>起始图像边数</label>
            <input type="number" min={3} step={1} value={edge} onChange={e=>setEdge(+e.currentTarget.value)} />
        </div>
        <div>
            <label>循环次数</label>
            <input type="number" min={0} step={1} value={loop} onChange={e=>setLoop(+e.currentTarget.value)} />
            注意: 分形是由你的浏览器计算的, 所以如果循环次数太高你的浏览器会很卡
        </div>
        <div>
            <div>种子:</div>
            {
                rands.map((x,i)=>{
                    return <div key={i}>
                        <div>
                            <label>x</label>
                            <input style={{width:200}} value={x[0]} type="number" min={-1} max={1} step={0.1} onChange={(e)=>{
                                const copy = rands.slice()
                                copy[i] = copy[i].slice() as Point
                                copy[i][0] = Number(e.currentTarget.value)
                                setRands(copy)
                            }}></input>
                        </div>
                        <div>
                            <label>y</label>
                            <input style={{width:200}} value={x[1]} type="number" min={-1} max={1} step={0.1} onChange={(e)=>{
                                const copy = rands.slice()
                                copy[i] = copy[i].slice() as Point
                                copy[i][1] = Number(e.currentTarget.value)
                                setRands(copy)
                            }}></input>
                        </div>
                    </div>
                })
            }
        </div>
    </div>
}

type Point = [number,number]

function makeFractal(rands:Point[], layer:number){
    
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