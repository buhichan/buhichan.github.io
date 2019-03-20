我在工作中遇到一个需要对Restful GET API查询性能进行优化的需求, 这里我用了一个ETag缓存机制来进行缓存, 下面讲一下是怎么做的.

# ETag介绍

> 你TM不会上[MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag)吗?

总之这是一个HTTP响应头, 前端请求了一个资源之后, 如果收到了这个ETag, 那么下一次请求同一个资源的时候就会将ETag的值放进If-None-Match这个请求头里, 用来让后端决定是否需要:
    - If-None-Match的值与当前ETag不符, 需要让浏览器再次下载资源
    - If-None-Match的值与当前ETag相符, 浏览器跳过下载, 使用浏览器端缓存的响应

可以看出, 如果我们的资源是一个文件的话, 那么可以用随便一个摘要算法用来做它的ETag值.

如果是一个GET API呢, 是不是也可以使用这个机制呢?

# 使用E-TAG对GET请求进行缓存

- 前提
    - 这个api是一个经常被请求, 但是查询结果却很少更新的api, 例如一个全量统计的api
- 机制
    - 首先, 后端需要一个hash表存储, 例如redis的一个hash.
    - 当一个请求来的时候, 可以得到当前请求的参数(searchParams)
        - 如果这个请求的searchParams是hash表的一个key
            - 将hash表的value作为E-Tag返回
            - 如果
                - If-None-Match请求头跟E-Tag相等, 则跳过请求的处理, 返回http 204(空内容)
            - 否则
                - 处理请求, 返回响应
        - 否则
            - 计算一个uuid
            - 在hash表的里插入:
                - key: 请求的参数
                - value: 刚才生成的uuid
            - 返回请求头:
                - E-Tag: 刚才生成的uuid
            - 处理请求, 返回响应
    - 当缓存不再有效, 清空这个hash表
        - 例如, 因为数据发生改变, 所以全量统计需要重新计算.

# 问题
肯定有优化的空间, 总感觉怪怪的, 但是暂时没想到在哪儿.