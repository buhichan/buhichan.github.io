(window.webpackJsonp=window.webpackJsonp||[]).push([[7],{"./src/routes/article/article-list.tsx":function(e,t,r){"use strict";r.d(t,"a",function(){return c});const c={"etag-caching-of-restful-api":"使用E-Tag进行API的缓存","how-to-make-an-ipfs-static-site":"如何把一个静态网站放到IPFS上","invent-wheel-or-not":"造轮子还是不造轮子","explore-react-fiber":"react fiber读书笔记","rxjs-vs-redux":"rxjs vs redux","stacking-context":"一句话搞明白层叠上下文"}},"./src/routes/article/index.tsx":function(e,t,r){"use strict";r.r(t);var c=r("react");var s=r("./src/services/router.tsx"),n=r("./src/routes/article/article-list.tsx"),a=r("./src/routes/article/render-markdown.tsx");function i(){const e=Object(s.c)().get("article"),[t]=function(e,t){const[r,s]=Object(c.useState)(null),n=c.useMemo(()=>()=>{e().then(s)},[]),[a,i]=Object(c.useState)(!1);return c.useEffect(()=>{let t=!1;return i(!0),e().then(e=>{t||(i(!1),s(e))}).catch(e=>{throw t||i(!1),e}),()=>{t=!0}},t),[r,n,s,a]}(async()=>e?fetch("/articles/"+e+".md").then(e=>e.text()):"",[e]);return t?c.createElement(a.a,{src:t}):c.createElement("div",null,Object.keys(n.a).map(e=>c.createElement("li",{key:e},c.createElement(s.a,{href:"/article?article="+e},n.a[e]))))}r.d(t,"default",function(){return i})}}]);