import * as React from "react"
import { Anchor } from "../services/router";
import { renderArticles } from "./article/article-list";

export default function (){
    return <>
        <section>
            <h2>关于我</h2>
            <p>宅宅, 懒癌, 运动白痴, 社交障碍, 三分钟热度, 不会骑自行车, 器用贫乏, 程序员. 喜欢摸🐱🐱, 喜欢P社4萌, 怪猎.</p>
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
            <h2>一些库</h2>
            <div>
                <ul>
                    <li>
                        <h3>
                            <Anchor href="https://github.com/buhichan/react-typed-router">React的强类型路由</Anchor>
                        </h3>
                        <div>
                            <ol>
                                <li>从Page组件的参数推导出pushHistory所需传的url参数的接口类型, 避免错传漏传参数</li>
                                <li>我希望强类型能覆盖前端开发的方方面面, 包括路由, react-router等路由库, 其参数的正确性仅仅是基于开发的自觉, 如果采用了typescript, 我们可以改善这一点, 这里没有直接用react-router.</li>
                            </ol>
                        </div>
                    </li>
                    <li>
                        <h3>
                            <Anchor href="https://github.com/buhichan/rehooker">用react-hook和rxjs和typescript的状态管理</Anchor>
                        </h3>
                        <div>
                            <ol>
                                <li>对typescript的支持友好, store本身和store的slice的类型都能被ts推导出来, 如果用ts的话比较方便;</li>
                                <li>用了rxjs, 所以中间件就是现成的rxjs操作符, 用法简单暴力无脑</li>
                                <li>轮子本身代码量很少, 主要是展示这个想法, 也就是用函数代替字符串的action, 当然这么做有利有弊, 利在于更清晰的代码条理(不需要搜action的type来搜reducer逻辑了), 更少的模式代码, 弊端是性能下降, 丧失了redux-devtool的支持.</li>
                            </ol>
                        </div>
                    </li>
                    <li>
                        <h3>
                            <a href="https://github.com/buhichan/rehooker-schema-form">React动态表单</a>
                        </h3>
                        <p>JSON表单, 支持表单项之间动态复杂的依赖关系, 这类型的轮子太多了, 不少这一个, 不多这一个.</p>
                        <Anchor href="/schema-form-demo">demo</Anchor>
                    </li>
                    <li>
                        <h3>  
                            <a href="https://github.com/buhichan/graphql-mongoose-service-template">
                             Graphql+Mongodb的CRUD后端生成器
                            </a>
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
                        <Anchor href="/fractal/webgl2-renderer?shader=julia-set">朱利亚集</Anchor>
                    </h3>
                    <p>Generative Art的hello world</p>
                </li>
                <li>
                    <h3>  
                        <Anchor href="/moonphase-painter">月球文翻译器</Anchor>
                    </h3>
                    <p>一个月球文翻译器</p>
                </li>
                <li>
                    <h3>  
                        <Anchor href="/emoji-player">Emoji播放器</Anchor>
                    </h3>
                    <p>一个使用Emoji来当作像素的视频播放器</p>
                </li>
            </ul>
        </section>
    </>
}


class Foo {
    lock
    isDirty(){
        this.lock.lock()
        //.......
        let res = 1===1
        this.lock.release()
        return res
    }
    update(){
        this.lock.lock()
        //.......
        if(this.isDirty()){
            //......
        }
        //.......
        this.lock.release()
    }
}