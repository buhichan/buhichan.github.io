(window.webpackJsonp=window.webpackJsonp||[]).push([[9],{"./src/routes/article/article-list.tsx":function(e,t,l){"use strict";l.d(t,"a",function(){return c});var r=l("react"),n=l("./src/services/router.tsx");function c(e=articleList,t=[]){return r.createElement("ul",null,Object.keys(e).sort((t,l)=>{let r=e[t],n=e[l],c=r.modifyTime||0,a=n.modifyTime||0;return t.match(/\d+\./)&&(c=Number.MAX_SAFE_INTEGER-Number(t.split(".")[0])),l.match(/\d+\./)&&(a=Number.MAX_SAFE_INTEGER-Number(l.split(".")[0])),a-c}).map(l=>{const a=e[l];return l.startsWith("_")?null:r.createElement("li",{key:l},"modifyTime"in a?r.createElement(r.Fragment,null,r.createElement(n.a,{href:"/article?article="+t.concat(l).join("/")},l.replace(".md",""))):r.createElement(r.Fragment,null,r.createElement("label",null,l),r.createElement("ul",null," ",c(a,t.concat(l)))))}))}},"./src/routes/index.tsx":function(e,t,l){"use strict";l.r(t);var r=l("react"),n=l("./src/services/router.tsx"),c=l("./src/routes/article/article-list.tsx");t.default=function(){return r.createElement(r.Fragment,null,r.createElement("section",null,r.createElement("h2",null,"关于我"),r.createElement("p",null,"宅宅, 懒癌, 运动白痴, 社交障碍, 三分钟热度, 不会骑自行车, 器用贫乏, 程序员. 喜欢摸小猫, P社4萌, 怪猎, 编程爱好者, 图形学",r.createElement("ruby",null,"业余爱好者",r.createElement("rp",null,"["),r.createElement("rt",null,"min ke"),r.createElement("rp",null,"]")),", rust",r.createElement("ruby",null,"业余爱好者",r.createElement("rp",null,"["),r.createElement("rt",null,"min ke"),r.createElement("rp",null,"]")))),r.createElement("section",null,r.createElement("h2",null,"一些想法"),r.createElement("div",null,Object(c.a)())),r.createElement("section",null,r.createElement("h2",null,"一些库"),r.createElement("div",null,r.createElement("ul",null,r.createElement("li",null,r.createElement("h3",null,r.createElement(n.a,{href:"https://github.com/buhichan/react-typed-router"},"React的强类型路由")),r.createElement("div",null,r.createElement("ol",null,r.createElement("li",null,"从Page组件的参数推导出pushHistory所需传的url参数的接口类型, 避免错传漏传参数"),r.createElement("li",null,"我希望强类型能覆盖前端开发的方方面面, 包括路由, react-router等路由库, 其参数的正确性仅仅是基于开发的自觉, 如果采用了typescript, 我们可以改善这一点, 这里没有直接用react-router.")))),r.createElement("li",null,r.createElement("h3",null,r.createElement(n.a,{href:"https://github.com/buhichan/rehooker"},"用react-hook和rxjs和typescript的状态管理")),r.createElement("div",null,r.createElement("ol",null,r.createElement("li",null,"对typescript的支持友好, store本身和store的slice的类型都能被ts推导出来, 如果用ts的话比较方便;"),r.createElement("li",null,"用了rxjs, 所以中间件就是现成的rxjs操作符, 用法简单暴力无脑"),r.createElement("li",null,"轮子本身代码量很少, 主要是展示这个想法, 也就是用函数代替字符串的action, 当然这么做有利有弊, 利在于更清晰的代码条理(不需要搜action的type来搜reducer逻辑了), 更少的模式代码, 弊端是性能下降, 丧失了redux-devtool的支持.")))),r.createElement("li",null,r.createElement("h3",null,r.createElement("a",{href:"https://github.com/buhichan/rehooker-schema-form"},"React动态表单")),r.createElement("p",null,"JSON表单, 支持表单项之间动态复杂的依赖关系, 这类型的轮子太多了, 不少这一个, 不多这一个."),r.createElement(n.a,{href:"/schema-form-demo"},"demo")),r.createElement("li",null,r.createElement("h3",null,r.createElement("a",{href:"https://github.com/buhichan/graphql-mongoose-service-template"},"Graphql+Mongodb的CRUD后端生成器")),r.createElement("p",null,"用来快速完成简单的业务系统, 或者是快速构建原型, 或者是用来做mockup服务器.")),r.createElement("li",null,r.createElement("h3",null,r.createElement(n.a,{href:"/virtual-scroll-demo/"},"无限滚动虚拟化列表")),r.createElement("p",null,"无限滚动虚拟化跟asyncIterator是同一个模型."))))),r.createElement("section",null,r.createElement("h2",null,"Demoscene"),r.createElement("ul",null,r.createElement("li",null,r.createElement("h3",null,r.createElement(n.a,{href:"/fractal/webgl2-renderer?shader=julia-set"},"朱利亚集")),r.createElement("p",null,"Generative Art的hello world")),r.createElement("li",null,r.createElement("h3",null,r.createElement(n.a,{href:"/moonphase-painter"},"月球文翻译器")),r.createElement("p",null,"一个月球文翻译器")),r.createElement("li",null,r.createElement("h3",null,r.createElement(n.a,{href:"/emoji-player"},"Emoji播放器")),r.createElement("p",null,"一个使用Emoji来当作像素的视频播放器")))))}}}]);
//# sourceMappingURL=9.927776835646aed57a35.js.map