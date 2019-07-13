import * as React from "react"
import {ArticleList} from "./article/article-list"
import { Anchor } from "../services/router";

export default function (){
    return <>
        <section>
            <h2>一些文章</h2>
            <ul>
                {
                    Object.keys(ArticleList).map(x=>{
                        return <li key={x}><Anchor href={"/article?article="+x}>{ArticleList[x]}</Anchor></li>
                    })
                }
            </ul>
        </section>
        <section>
            <h2>github上的项目</h2>
            <div>
                <ul>
                    <li>
                        <h3>
                            <a href="https://github.com/buhichan/rehooker">一个使用react-hook和rxjs和typescript的状态管理库, 代替redux</a>
                        </h3>
                        <p>与redux的不同之处在于对typescript的支持很友好, store本身和store的slice的类型都能被ts推导出来, 如果用ts的话比较方便;</p>
                        <p>另外一方面是使用了rxjs, 所以不需要action中间件就能完成对副作用的完美处理</p>
                    </li>
                    <li>
                        <h3>
                            <a href="https://github.com/buhichan/rehooker-schema-form">一个react表单组件</a>
                        </h3>
                        <p>支持表单项之间动态复杂的依赖关系</p>
                        <Anchor href="/schema-form-demo/">demo</Anchor>
                    </li>
                    <li>
                        <h3>  
                            <a href="https://github.com/buhichan/graphql-mongoose-service-template">一个根据json声明快速生成graphql+mongodb后端的库</a>
                        </h3>
                        <p>主要用来快速完成简单的业务系统, 或者是快速构建原型, 或者是用来做mockup服务器</p>
                    </li>
                    <li>
                        <h3>  
                            <Anchor href="/virtual-scroll-demo/">无限滚动虚拟化列表</Anchor>
                        </h3>
                        <p>一个利用异步iterable的无限滚动虚拟化列表</p>
                    </li>
                </ul>
            </div>
        </section>
        <section>
            <h2>fun</h2>
            <ul>
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