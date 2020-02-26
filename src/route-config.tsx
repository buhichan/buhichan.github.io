import * as React from "react"

export type IRoute<P=any> = {
    path:string,
    name:string,
    component:React.ExoticComponent<P>,
    children?:IRoute[]
}

export const routes:IRoute[] = [
    {
        path:"/",
        name:"Home",
        component:React.lazy(()=>import("./routes")),
    },
    {
        path:"/fractal",
        name:"一些图形",
        component:React.lazy(()=>import("./routes/fractal/index")),
        children:[
            {
                path:"/fractal/segments",
                component:React.lazy(()=>import("./routes/fractal/segments")),
                name:"简单的分形: 线段",
            },{
                path:"/fractal/webgl2-renderer",
                name:"WebGL2",
                component:React.lazy(()=>import("./routes/fractal/webgl2-renderer")),
            }
        ]
    },{
        path:"/article",
        name:"一些想法",
        component:React.lazy(()=>import("./routes/article")),
    },{
        path:"/demos",
        name:"一些小玩意儿",
        component:React.lazy(()=>import("./routes/demos")),
        children:[
            {
                path:"/emoji-player",
                name:"EmojiPlayer",
                component:React.lazy(()=>import("./routes/demos/emoji-player")),
            },{
                path:"/css-experiments",
                name:"CSS实验",
                component:React.lazy(()=>import("./routes/demos/css-experiments")),
            },{
                path:"/schema-form-demo",
                name:"FormDemo",
                component:React.lazy(()=>import("./routes/demos/schema-form-demo")),
            },{
                path:"/virtual-scroll-demo",
                name:"VirtualScrollDemo",
                component:React.lazy(()=>import("./routes/demos/virtual-scroll-demo")),
            },{
                path:"/114514-calculator",
                name:"114514 Calculator",
                component:React.lazy(()=>import("./routes/demos/114514")),
            }
        ]
    }
]
