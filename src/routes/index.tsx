import * as React from "react"
import { Anchor } from "../services/router";
import { renderArticles } from "./article/article-list";

export default function (){
    return <>
        <section>
            <h2>关于我</h2>
            <p>宅宅, 懒癌, 运动白痴, 社交障碍, 三分钟热度, 不会骑自行车, 器用贫乏, 程序员. 喜欢摸🐱🐱, 喜欢P社4萌.</p>
        </section>
        <section>
            <h2>一些想法</h2>
            <div>
                {
                    renderArticles()
                }
            </div>
        </section>
        <section>
            <h2>一些轮子</h2>
            <div>
                <ul>
                    <li>
                        <h3>
                            <a href="https://github.com/buhichan/rehooker">用react-hook和rxjs和typescript的状态管理</a>
                        </h3>
                        <div>关于为什么搞个这类型轮子的几个点:
                            <ol>
                                <li>对typescript的支持很友好, store本身和store的slice的类型都能被ts推导出来, 如果用ts的话比较方便;</li>
                                <li>用了rxjs, 所以中间件就是现成的rxjs操作符, 用法简单暴力无脑</li>
                                <li>轮子本身代码量很少, 主要是展示这个想法, 也就是用函数代替字符串的action, 当然这么做有利有弊, 利在于更清晰的代码条理(不需要搜action的type来搜reducer逻辑了), 更少的模式代码, 弊端是性能下降, 丧失了redux-devtool的支持.</li>
                            </ol>
                        </div>
                    </li>
                    <li>
                        <h3>
                            <a href="https://github.com/buhichan/rehooker-schema-form">一个react表单组件</a>
                        </h3>
                        <p>JSON表单, 支持表单项之间动态复杂的依赖关系, 这类型的轮子太多了, 不少这一个, 不多这一个.</p>
                        <Anchor href="/schema-form-demo/">demo</Anchor>
                    </li>
                    <li>
                        <h3>  
                            <a href="https://github.com/buhichan/graphql-mongoose-service-template">
                            一个根据json元数据声明快速生成graphql+mongodb后端的库</a>
                        </h3>
                        <p>用来快速完成简单的业务系统, 或者是快速构建原型, 或者是用来做mockup服务器.</p>
                    </li>
                    <li>
                        <h3>  
                            <Anchor href="/virtual-scroll-demo/">无限滚动虚拟化列表</Anchor>
                        </h3>
                        <p>无限滚动虚拟化跟asyncIterator是同一个模型.</p>
                    </li>
                </ul>
            </div>
        </section>
        <section>
            <h2>Demoscene</h2>
            <ul>
                <li>
                    <h3>  
                        <Anchor href="/?shader=julia-set#/fractal/webgl2-renderer">朱利亚集</Anchor>
                    </h3>
                    <p>Generative Art的hello world</p>
                </li>
                <li>
                    <h3>  
                        <Anchor href="/moonphase-painter/index.html">月球文翻译器</Anchor>
                    </h3>
                    <p>一个月球文翻译器</p>
                </li>
                <li>
                    <h3>  
                        <Anchor href="/emoji-player/build/">Emoji播放器</Anchor>
                    </h3>
                    <p>一个使用Emoji来当作像素的视频播放器</p>
                </li>
            </ul>
        </section>
    </>
}