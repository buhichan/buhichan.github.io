const webpack = require("webpack")
const path = require("path")
// const CopyWebpackPlugin = require("copy-webpack-plugin")
const app = require('express')()
const serveStatic = require('serve-static')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')
const CircularDependencyPlugin = require("circular-dependency-plugin")
const TerserPlugin = require('terser-webpack-plugin')
const HtmlWebpackPlugin = require("html-webpack-plugin")
const DynamicCdnWebpackPlugin = require('dynamic-cdn-webpack-plugin');

const compiler = webpack({
    mode:process.env.NODE_ENV,
    output:{
        path:path.resolve("./dist"),
        ...process.env.NODE_ENV === 'production' ? {
            publicPath:"/dist",
            filename: "[name].[chunkhash].js",
            chunkFilename: '[name].[chunkhash].js'
        } : {
            publicPath:"/",
            filename: "[name].js",
            chunkFilename: '[name].js'
        },
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
            },
            {
                test:/\.glsl$/,
                loader:"raw-loader"
            }
        ]
    },
    resolve:{
        extensions:[".js",".ts",".tsx",".css",".glsl"]
    },
    plugins:[
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname,'./src/index.html'),
            inject: 'body',
            chunksSortMode:"none",
        }),
        new CircularDependencyPlugin({
            // exclude detection of files based on a RegExp
            exclude: /node_modules/,
            // add errors to webpack instead of warnings
            failOnError: true,
            // allow import cycles that include an asyncronous import,
            // e.g. via import(/* webpackMode: "weak" */ './file.js')
            allowAsyncCycles: false,
            // set the current working directory for displaying module paths
            cwd: process.cwd(),
        }),
        new webpack.NamedModulesPlugin(),
        ...process.env.NODE_ENV === 'production' ? [
            new DynamicCdnWebpackPlugin({
                only: ['react', 'react-dom', 'moment', 'three'],
                verbose:true,
                resolver:(modulePath, version)=>{
                    const moduleName = path.basename(modulePath)
                    return {
                        name:moduleName, 
                        var:{
                            'three':"THREE",
                            'react':'React',
                            'react-dom':"ReactDOM",
                            'moment':"moment",
                        }[moduleName], 
                        url:`https://unpkg.com/${moduleName}@${version}/${{
                            'three':"build/three.js",
                            'react':"umd/react.production.min.js",
                            'react-dom':"umd/react-dom.production.min.js",
                            'moment':"moment.js",
                        }[moduleName]}`, 
                        version
                    }
                }
            }),
            new BundleAnalyzerPlugin({
                analyzerMode:"static"
            }),
        ] : []
    ],
    optimization:{
        usedExports:true,
        minimizer:[
            ...process.env.NODE_ENV === 'production' ? [
                new TerserPlugin({
                    sourceMap:true,
                    terserOptions:{
                        mangle: {
                            /**
                             * uglify必须忽略掉process.env.NODE_ENNV这样的变量名
                             */
                            reserved: ['process']
                        }
                    }
                })
            ] : [],
        ],
        noEmitOnErrors:process.env.NODE_ENV === 'development',
        runtimeChunk:"single",
        nodeEnv:process.env.NODE_ENV,
        /**
         * 把不常更新的依赖移动到单独的vendors文件, 获得long term caching.
         */
        splitChunks:{ 
            cacheGroups:{
                antd: {
                    name:"antd",
                    minSize:0,
                    minChunks: 1,
                    chunks: "all",
                    test: /node_modules\/(antd|rc-[a-z\-]+|@ant-design)\//,
                    priority: 200
                },
                vendors: {
                    name:"vendors",
                    minSize:0,
                    minChunks: 1,
                    chunks: "all",
                    test: /node_modules\/(three|antd|rc-[a-z\-]+|@ant-design|moment|react|react-dom|rxjs)\//,
                    priority: -10
                },
                default: {
                    priority: -20,
                    reuseExistingChunk: true
                }
            }
        }
    },
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