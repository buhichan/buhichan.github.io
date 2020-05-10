在js中, 异步回调任务的方法存在以下优先级, 除了平台特有的方法之外的优先级的原因是ecmascript规定了事件队列的实现方式. 每个任务都有一个微任务队列, 只有待运行的微任务队列为空才能进行pop任务.

任务也俗称宏任务, 但是我记得ecmascript的标准里面叫task和microtask, 没有macrotask一说.

> process.nextTick(nodejs独有) > 微任务 > 任务 > requestIdleCallback(浏览器独有)

# 微任务

- process.nextTick也是微任务, 但是它有专属队列, 总是比别的快
- Promise.then
    - 注意, Promise构造函数总是同步执行的, then才是创建微任务
- queryMicrotask(浏览器独有)

# 宏任务

- setTimeout 
- setInterval
- I/O

# 其他

- requestIdleCallback(浏览器独有)
    - 总是在任务队列为空的时候才执行
- requestAnimationFrame(浏览器独有)
    - 不确定什么时候执行, 不过总是在当前同步任务的微任务执行完之后才有可能被调用

