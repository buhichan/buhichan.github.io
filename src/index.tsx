
import * as React from "react"
import { Route,history, Anchor } from "./services/router";
const ReactDOM = require('react-dom')
import "./styles/style.css"

type IRoute<P=any> = {
    path:string,
    name:string,
    component:React.ExoticComponent<P>,
    children?:IRoute[]
}

const routes:IRoute[] = [
    {
        path:"/",
        name:"首页",
        component:React.lazy(()=>import("./routes")),
    },
    {
        path:"/fractal",
        name:"fractal",
        component:React.lazy(()=>import("./routes/fractal")),
        children:[
            {
                path:"/fractal/segments",
                component:React.lazy(()=>import("./routes/fractal/segments")),
                name:"分形线段",
            },{
                path:"/fractal/webgl2-renderer",
                name:"raw webgl2",
                component:React.lazy(()=>import("./routes/fractal/webgl2-renderer")),
            }
        ]
    },{
        path:"/article",
        name:"文章",
        component:React.lazy(()=>import("./routes/article")),
    },{
        path:"/emoji-player",
        name:"EmojiPlayer",
        component:React.lazy(()=>import("./routes/emoji-player")),
    },{
        path:"/css-experiments",
        name:"CSS实验",
        component:React.lazy(()=>import("./routes/css-experiments")),
    },{
        path:"/schema-form-demo",
        name:"FormDemo",
        component:React.lazy(()=>import("./routes/schema-form-demo")),
    },{
        path:"/virtual-scroll-demo",
        name:"VirtualScrollDemo",
        component:React.lazy(()=>import("./routes/virtual-scroll-demo")),
    }
]

function renderRoutes(routes:IRoute[]):React.ReactNode[]{
    let res = []
    for(let x of routes){
        if(x.children){
            res = res.concat(renderRoutes(x.children))
        }else{
            res.push(<Route key={x.path} path={x.path} component={x.component} />)
        }
    }
    return res
}

function renderMenu(routes:IRoute[]){
    return <ul>
        {
            routes.map(route=>{
                return <li key={route.path}>
                    <Anchor href={route.path}>{route.name}</Anchor>
                    {route.children ? renderMenu(route.children) : null}
                </li>
            })
        }
    </ul>
}

function App(){
    return <>
        <header>
            <span>阿布的Github.io博客</span>
        </header>
        <section id="sidebar">
            {renderMenu(routes)}
        </section>
        <section id="content">
            {renderRoutes(routes)}
        </section>
        <footer>
            All rights reserved.
        </footer>
    </>
}

const topBarHeight = 58
const sidebarWidth = 240

ReactDOM.render(<App />, document.getElementById("root"))