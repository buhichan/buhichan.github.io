import * as React from "react"
import { Route, history, Anchor } from "./services/router"
import * as ReactDOM from "react-dom"
import "./styles/style.css"
import { IRoute, routes } from "./route-config"

function renderRoutes(routes: IRoute[]): React.ReactNode[] {
    let res = []
    for (let x of routes) {
        res.push(<Route key={x.path} path={x.path} component={x.component} />)
        if (x.children) {
            res.push(...renderRoutes(x.children))
        }
    }
    return res
}

function renderMenu(routes: IRoute[]) {
    return (
        <ul>
            {routes.map(route => {
                return (
                    <li key={route.path}>
                        <Anchor href={route.path}>{route.name}</Anchor>
                        {route.children ? renderMenu(route.children) : null}
                    </li>
                )
            })}
        </ul>
    )
}

function App() {
    return (
        <>
            <header>
                <span>阿布的博客</span>
            </header>
            <section id="sidebar">
                {renderMenu(routes)}
                <div id="sidebar-toggle" tabIndex={1}></div>
            </section>
            <section id="content">{renderRoutes(routes)}</section>
            <footer>All rights reserved.</footer>
        </>
    )
}

const topBarHeight = 58
const sidebarWidth = 240

ReactDOM.render(<App />, document.getElementById("root"))
