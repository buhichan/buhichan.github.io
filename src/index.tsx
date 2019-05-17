
import * as React from "react"
import { Route,history } from "./services/router";
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

function renderRoutes(routes:IRoute[]){
    return routes.map(x=>{
        return <Route key={x.path} path={x.path === "/" ? /^\/$/: new RegExp(x.path)}>
            {(matchs)=>import("./routes"+x.path).then(({default:Comp})=>{
                return <>
                    <Comp params={Array.from(matchs || [])} />
                    {x.children ? renderRoutes(x.children) : null}
                </>
            })}
        </Route>
    })
}

function renderMenu(routes:IRoute[]){
    return <ul>
        {
            routes.map(route=>{
                return <li key={route.path}>
                    <a href={route.path} onClick={e=>{
                        e.preventDefault()
                        history.push(route.path)
                    }}>{route.name}</a>
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