
import * as React from "react"
import { Route,history, Anchor } from "./services/router";
const ReactDOM = require('react-dom')
import "./styles/style.css"

type IRoute = {
    path:string,
    name:string,
    children?:IRoute[]
}

const routes:IRoute[] = [
    {
        path:"/",
        name:"首页",
    },
    {
        path:"/fractal",
        name:"分形",
        children:[
            {
                path:"/fractal",
                name:"分形线段",
            },{
                path:"/fractal/julia-set",
                name:"朱力亚集"
            }
        ]
    },{
        path:"/article",
        name:"文章",
    },{
        path:"/emoji-player",
        name:"EmojiPlayer",
    },{
        path:"/css-experiments",
        name:"CSS实验"
    },{
        path:"/schema-form-demo",
        name:"FormDemo"
    },{
        path:"/virtual-scroll-demo",
        name:"VirtualScrollDemo"
    }
]

const PUBLIC_PREFIX = "/dist"

function renderRoutes(routes:IRoute[]):React.ReactNode[]{
    let res = []
    for(let x of routes){
        if(x.children){
            res = res.concat(renderRoutes(x.children))
        }else{
            res.push(<Route prefix={PUBLIC_PREFIX} key={x.path} path={x.path}>
                {()=>import("./routes"+x.path).then(({default:Comp})=>{
                    return <Comp />
                })}
            </Route>)
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