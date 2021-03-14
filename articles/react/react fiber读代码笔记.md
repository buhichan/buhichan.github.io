# React Fiber 读书笔记

注: 以下只针对 FunctionalComponent, 完全忽略 class 的写法, 因为那个不用关心.

## 概念

-   什么是 fiber
    -   fiber 就是一个表示一个单位的工作量, performUnitOfWork 的 unitOfWork 就是一个 fiber 树
    -   同时也是 vdom 的单位节点,
    -   同时也是 hook 等状态的存放地点, 每一个 fiber 对应的是一个 React.ReactNode
    -   fiber 是一棵树, 其中有这些指针, 指向另外一个有关系的 fiber
        -   alternate
            -   alternate fiber 表示更新和当前的区别, 相当于 OpenGL 里的 double buffer
        -   child
            -   就是第一个子 fiber
        -   sibling
            -   相邻的 fiber
        -   return
            -   就是 parent, return.child === self
    -   fiber 是什么时候产生的
        -   是在 mount 的过程中产生的, 一开始只有一个 HostRoot, 是一个抽象的 Node, 这个 HostRoot 下面会有一个根 fiber, 调用这个根 fiber 的 render 方法, 能得到其返回的 ReactElement, 对于这些 ReactElements, 迭代下去就能得到 fiber 树
-   什么是 render
    -   render 也叫 performWork/workLoop
    -   render 就是造出新的 vdom 树, 新的 vdom 树叫做 finishedWork/workInProgress
    -   render 过程调用下面几个 lifecycles, 想想为什么这些恰好都是要废弃的 lifecycles?
        - 旧生命周期
            -   componentWillMount
            -   componentWillReceiveProps
            -   componentWillUpdate
        - 新生命周期
            -   getDerivedStateFromProps 无状态, 替代willMount和willReceiveProps
    -   初始 mount / setState 可以触发 render,触发之后过程如下, 见 updateClassInstance 函数
        -   componentWillMount
        -   componentWillReceiveProps
        -   处理 updateQueue 生成新的 state, 也就是合并同一个 task 里的 setState 进行批处理
        -   getDervicedStateFromProps
        -   shouldComponentUpdate
        -   componentWillUpdate
        -   调度异步 call: componentDidUpdate
        -   更新 this.state/this.props
        -   调用 render 生成新 ReactElement 树
        -   在 updateXXXXXComponent 中 reconcile 新 children
            -   为子 fiber 创建 pendingProps
            -   reconcile 里会根据子 vdom 树创建更多 work, 触发在组件树上的向下递归
    -   render 也就是 workLoop 在 fibermode 下是可拆分的, 不会阻塞浏览器渲染, 而 commit 是同步的,这是为了 consistency, 也就是 react 不会只渲染一半的 dom 改变
-   什么是 reconcile(核对)
    -   核对就是通过比较旧的 Fiber 和新的由组件的 render 方法返回的 ReactElement, 来得到新的 Fiber, 并且构造 effectTree 的过程, 但是并不执行 effectTree
    -   这个就是面试中俗称的 react 的 diff 算法
        -   参见[ReactChildFiber.js#reconcileChildFibers](https://github.com/facebook/react/blob/16.8.6/packages/react-reconciler/src/ReactChildFiber.js#L1219)
            -   如果是对象
                -   如果是 Element
                -   如果是 Portal
            -   如果是 Number 或者 String
                -   是 TextNode
            -   如果是 Array/Iterator
                -   调用 reconcileChildrenArray/Iterator, 实现基本一样
                    -   第一遍循环, 只看 key, 对于非法 key/重复的 key, warn.
                    -   第二遍循环, 这个循环应该是处理 implicit keys 的
                    -   创建一个 HashMap, key 到 old fiber
                    -   第三遍循环, 从 map 里找到旧 fiber, 如果有, 那么调用 placeChild, 并且删掉 map 里对应的 key, 因为 map 等会会被用作待删除 children 列表
                    -   把 map 里剩下的 mark effect flag 为待删除
            -   处理错误情况: 渲染结果是 Function, undefined, 空 Fragment
            -   其余情况视为空 Children
        -   这里如果某个函数式组件是被 memo, 且浅比较相等, 则他的 render 方法不会被调用, 进而跳过核对
-   什么是 effectTree
    -   就是由 reconcile 这个过程得到的 fiber 的链表, 由 fiber 上的 firstEffect 开始, nextEffect 构成的树, 表示应该执行的 dom 操作, 但是其实并不真的执行, 而是由 commitEffect 完成实际的执行
-   commitEffect
    -   react 里的 effect 分为这么几类, pre-mutation, mutation, post-mutation
    -   pre-mutation:
        -   getSnapshotBeforeUpdate
    -   mutation:
        -   componentWillUnmount
        -   调用 useEffect 和 useLayoutEffect 的清理函数
        -   DOM 操作
    -   post-mutation:
        -   componentDidMount
        -   commit layout type effects, e.g. useLayoutEffect
    -   ensure root is schedules, i.e. ensure passive effects like useEffect are scheduled.

## ReactDOM.render 中发生了什么

-   performSyncWorkOnRoot
-   workLoopSync
    -   performUnitOfWork
        -   beginWork
            -   mountXXXComponent/updateXXXComponent
                -   nextChildren = render()
            -   reconcileChildren
                -   这个函数不是递归的
                    -   只管 child, 别的由 workloop 管
                -   FiberNode.child = new FiberNode()
-   finishSyncRender
    -   commitRoot
        -   commitRootImpl
            -   flushPassiveEffects
            -   这里注意了, 这里要开始计时, commit 如果超时了, 会怎么样呢
            -   startCommitTimer
            -   remainingExpirationTime = Math.max(finishedWork.expirationTime, finishedWork.childExpirationTime)
            -   进入 commit phase
                -   需要 commit 的 fiber 称为 finishedWork
                -   进入 commit phase 的标志是 ReactCurrentOwner 设为 null
                -   prepareForCommit
                    -   做一些准备工作, 比如
                        -   获取当前 focus 的元素的 selectionRange (为啥?)
                        -   disable 掉事件(为啥?)
                -   创建一个指针 nextEffect 指向 finishedWork.firstEffect
                -   commit phase 分为多个阶段
                    -   commitbeforeMutationLifecycles
                        -   getSnapshot
                    -   mutation
                        -   包括:
                            -   ContentReset
                            -   Ref
                            -   Placement | Update | Deletion | Hydrating
                                -   这里就是操作 Host 进行 DOMNode 操作的地方
                                -   在 Deletion 前会清理所有副作用, 例如调用 componentWillUnmount, 调用 use\(Effect\)Layout 的清理函数.
                    -   resetAfterCommit, 恢复 prepareForCommit 保存的状态
                    -   把 workInProgress 的 fiber tree 设为 current
                    -   layout effects
                        -   包括
                            -   Update | Callback
                            -   Ref
                -   Scheduler.requestPaint()
-   关于 Scheduler
    -   默认优先级
        -   只要不是在事件监听函数里都是同步的级别

## Suspense

Suspense 一开始是作为跟 React.lazy 配合的 code splitting 方案, 然而当某些人发现其内使用的 throw Promise 机制可以用来载入数据的时候, 就开始变了.

-   React.lazy
    -   只是创建一个特殊的 ReactElement 而已, 其 type 是一个 Symbol
    -   其内部会有一个状态\_status, 记录 promise 的状态
-   当 react-reconciler 的 workLoop 遇到一个 LazyComponent, 在 mountLazyComponent 的时候, 如果其为 pending, 则会 throw 这个 Promise
    -   见 [ReactFiberLazyComponent.js](https://github.com/facebook/react/blob/16.8.6/packages/react-reconciler/src/ReactFiberLazyComponent.js) 和 [ReactFiberBeginWork.js](https://github.com/facebook/react/blob/16.8.6/packages/react-reconciler/src/ReactFiberBeginWork.js#L1112)
-   workLoop 外面的 try catch 会捕获到这个 render phase 的错误, 然后交给[handleError](https://github.com/facebook/react/blob/16.8.6/packages/react-reconciler/src/ReactFiberWorkLoop.js#L1279)处理
    -   如果发现这个是一个 Promise(thenable), 则会沿着 fiber.return 往上一直找到一个 Suspense, 然后把这个 promise 添加到 suspense 的 updateQueue(是个 Set)里面, 然后重新从这个 Suspense 渲染, 当然这里会得到一个 fallback 的 Suspense.

## Expiration

TODO
