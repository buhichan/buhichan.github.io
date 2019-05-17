const webpack = require("webpack")
const path = require("path")
// const CopyWebpackPlugin = require("copy-webpack-plugin")
const app = require('express')()
// const HTMLWebpackPlugin = require("html-webpack-plugin")

const compiler = webpack({
    mode:process.env.NODE_ENV,
    output:{
        path:path.resolve("./"),
        publicPath:"/",
        filename: process.env.NODE_ENV === 'development' ? "[name].js":"[name].[chunkhash].js",
        chunkFilename: process.env.NODE_ENV === 'development' ?"[name].js": '[name].js'
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

    app.get('*', function(req, res) {
        const indexPath = path.resolve("index.html")
        if(webpackDevMiddleware.fileSystem.existsSync(indexPath)){
            const index = webpackDevMiddleware.fileSystem.readFileSync(indexPath); 
            // res.set({'Content-Length':1000*1000})
            res.end(index);
        }else{
            res.end(webpackDevMiddleware.fileSystem.readdirSync(path.resolve(".")))
        }
        // res.connection.end();
    })
    
    app.listen(8093,"::",()=>{
        console.log('running at http://localhost:8093')
    })
    
}