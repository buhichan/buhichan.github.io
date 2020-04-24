
# 2019

## OSI Model / TCP/IP Model

- Layer 1: Physical Layer 物理层
- Layer 2: Data Link Layer 数据链路层
- Layer 3: Network Layer 网络层 
- Layer 4: Transport Layer 传输层 
- Layer 5: Session Layer 会话层
- Layer 6: Presentation Layer 表达层 
- Layer 7: Application Layer 应用层

TCP/IP模型中, 5~7层被省略合称为应用层, 因此只有5层

## 浏览器输入一个URL回车之后发生了什么

- 查找 DNS 缓存
    - 有下列几级缓存
        - DNS 浏览器缓存
        - DNS 本地缓存
            - hosts 文件
        - DNS 路由器缓存
        - DNS ISP缓存
    - 如果没有缓存则DNS运营商的服务器会发一个DNS解析请求到根域名服务器
- DNS lookup
    - udp协议
    - 有一个flag告诉服务器要不要递归查询
        - DNS解析器查询根域名服务器
        - DNS解析器查询一级域名服务器
        - DNS解析器查询二级域名服务器
        - ...
    - 返回记录,如果没有就失败了
- TCP 连接 (网络层)
    - 三次握手
        - SYN
            - 客户端请求建立连接
        - SYN+ACK
            - 服务端根据自己判断(例如port是否已经用完了),
        - ACK
    - 后续
        - ACK & ACK Number
- TLS 握手 (大概是会话层, 其实很模糊)
    - client hello
    - server hello
        - certificate
        - server hello done
    - client
        - client key exchange
        - change cipher spec
        - finished
    - server
        - change cipher spec
        - finished
    - TLS 为什么可以防御中间人攻击
        - 非对称加密签名和CA(certificate authority, 证书授权)保证了签名即使被伪造了也无法跟域名对应
- HTTP请求
- HTTP响应
- 渲染


## 浏览器缓存机制

前端缓存加速的基本方案

下面部分文字直接摘抄自[这位大佬](http://qingbob.com/cache-design/). 浏览器缓存机制基本的顺序是 

1. Memory Cache
    - “内存缓存”中主要包含的是当前文档中页面中已经抓取到的资源。例如页面上已经下载的样式、脚本、图片等。我们不排除页面可能会对这些资源再次发出请求，所以这些资源都暂存在内存中，当用户结束浏览网页并且关闭网页时，内存缓存的资源会被释放掉。

    - 这其中最重要的缓存资源其实是preloader相关指令（例如<link rel="prefetch">）下载的资源。总所周知preloader的相关指令已经是页面优化的常见手段之一，而通过这些指令下载的资源也都会暂存到内存中。根据一些材料，如果资源已经存在于缓存中，则可能不会再进行preload。
    需要注意的事情是，内存缓存在缓存资源时并不关心返回资源的HTTP缓存头Cache-Control是什么值，同时资源的匹配也并非仅仅是对URL做匹配，还可能会对Content-Type，CORS等其他特征做校验
    - Memory cache 持久化之后就是disk cache
    - Memory cache 跟 Cache-Control无关
2. Service Worker
    - Service worker主要靠拦截fetch请求和cacheStorage缓存 (此处需要补充)
    - 虽然Service worker优先级在HTTP Cache之前, 但是使用了sw, 并不代表就disable了http cache, 如果此时设置了 cache-control: <1年的秒数>,则会出现缓存了失效资源的问题. 所以我们必须要设置cache-control: no-cache 来绕过HTTP Cache. 在TL这个项目上我遇到过这个坑.
3. HTTP Cache
    1. HTTP1.0
        - Expires 一个时间点
    2. HTTP1.1
        1. Cache-Control
            1. No-store
                - 表示不缓存
            2. No-cache
                - 表示使用缓存之前要向服务器验证
            3. Max-age, must-revalidate
                - 表示缓存新鲜(存活小于max-age)则可以不必验证, 否则应该(must-revalidate: 必须)验证
        2. Last-Modified
            - If-Modified-Since
        3. Etag
            1) If-None-Match
    3. HTTP Cache的顺序是
        1. no-store ? 
        2. no-cache ?
        3. public ? 
        4. max-age/expire
        5. e-tag
    4. Expires, max-age称为强缓存
    5. last-modified和ETag为协商缓存(服务器仍然需要少量处理)
            
4. Push “Cache”
    - http2 的 push机制提供的缓存方法

有serviceworker 用 serviceworker
没有就etag/if-none-match
Etag不合适就cache-control

# JS性能优化

> One large change to the cost of JavaScript over the last few years has been an improvement in how fast browsers can parse and compile script. In 2019, the dominant costs of processing scripts are now download and CPU execution time.
>
> -- <cite>[https://v8.dev/blog/cost-of-javascript-2019](https://v8.dev/blog/cost-of-javascript-2019)</cite>

- 优化下载时间
    - 减少单个脚本大小到50K-100K左右
    - &lt;preload /&gt; 标签
    - 上http2
        - http2复用http连接, 对同时多请求的支持好
    - 给script 标签加上async
- 优化执行时间
    - 使用profiler优化执行时间长的函数 ( Long Task )
- 避免inline script 标签


# HTML Parser
- preload scan
    - script, preload, ... 
        - download
- parse html to dom 
- parse css to cssom 