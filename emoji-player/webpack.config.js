/**
 * Created by YS on 2016/8/26.
 */
"use strict";
const path=require('path');

const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')


let NODE_ENV = process.env.NODE_ENV

module.exports = {
    entry: {
        "main":[__dirname+`/src/index.tsx`]
    },
    mode:NODE_ENV,
    output: {
        path:  __dirname +"/build/",
        publicPath: "/emoji-player/build/",
        filename: NODE_ENV === 'production' ? "[name].[chunkHash].js" : "[name].js",
        chunkFilename: NODE_ENV==='development' ? '[name].[chunkHash].js' : '[name].js'
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: "awesome-typescript-loader",
        }]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: __dirname+'/src/index.html',
            inject: 'body'
        }),
        new CopyWebpackPlugin([
            {
                from:"./node_modules/ffmpeg.js/ffmpeg-worker-mp4.js",
                to:"node_modules/ffmpeg.js/ffmpeg-worker-mp4.js"
            },{
                from:"./node_modules/ffmpeg.js/ffmpeg-worker-webm.js",
                to:"node_modules/ffmpeg.js/ffmpeg-worker-webm.js"
            },{
                from:"./assets",
                to:"assets"
            }
        ]),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': NODE_ENV==='development'?"'development'":"'produdction'"
        })
    ],
    devServer:{
        contentBase: '.',
        stats:'minimal',
        port:10004
    },
    devtool:"source-map",
    resolve:{
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.html']
    }
}