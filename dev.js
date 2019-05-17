const webpack = require("webpack")
const path = require("path")
// const CopyWebpackPlugin = require("copy-webpack-plugin")
const app = require('express')()
const serveStatic = require('serve-static')
// const HTMLWebpackPlugin = require("html-webpack-plugin")

const compiler = webpack({
    mode:process.env.NODE_ENV,
    output:{
        path:path.resolve("./"),
        publicPath:"/",
        filename: "[name].js",
        chunkFilename: '[name].js'
    },
    entry:{
        main:[
            path.resolve("./src/index.tsx"),
        ]
    },
    module:{
        rules:[
            {
                test:/\.tsx?$/,
                loader:"awesome-typescript-loader",
            },
            {
                test:/\.css?$/,
                loader:[
                    "style-loader",
                    "css-loader",
                ]
            }
        ]
    },
    resolve:{
        extensions:[".js",".ts",".tsx",".css"]
    },
    plugins:[
        // new CopyWebpackPlugin([
        //     {
        //         from:path.resolve("./assets"),
        //         to:"assets"
        //     },
        //     {
        //         from:path.resolve("./articles"),
        //         to:"articles"
        //     },
        // ]),
        // new HTMLWebpackPlugin({
        //     template:path.resolve("./src/index.html"),
        //     inject:"body",
        // })
    ],
    watch:process.env.NODE_ENV === 'development'
})

if(process.env.NODE_ENV === "production"){
    compiler.run(()=>{
        console.log("Done.")
    })    
}else{
    const webpackHotMiddleware = require("webpack-hot-middleware");
    const webpackDevMiddleware = require('webpack-dev-middleware')(compiler, {
        devtool:"inline-source-map",
        host:"0.0.0.0",
        hot:true,
        noInfo:true,
        inline:true,
        progress:true,
    });
    
    app.use(webpackDevMiddleware);
    app.use(webpackHotMiddleware(compiler));

    app.use(serveStatic("."))

    app.use(function(req, res, next) {
        if(!req.path.match(/\.[a-z]{3,6}$/)){
            res.sendFile(path.resolve("./index.html"))
        }else
            next()
    })
    
    app.listen(8093,"::",()=>{
        console.log('running at http://localhost:8093')
    })
    
}