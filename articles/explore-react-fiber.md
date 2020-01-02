# React Fiber 读书笔记

注: 以下只针对FunctionalComponent, 完全忽略class的写法, 因为那个不用关心.

## 概念
- 什么是fiber
    - fiber 就是一个表示一个单位的工作量, performUnitOfWork的unitOfWork就是一个fiber树
    - 同时也是vdom的单位节点,
    - 同时也是hook等状态的存放地点, 每一个fiber对应的是一个React.ReactNode
    - fiber是一棵树, 其中有这些指针, 指向另外一个有关系的fiber
        - alternate
            - alternate fiber表示更新和当前的区别, 相当于OpenGL里的double buffer
        - child
            - 就是第一个子fiber
        - sibling
            - 相邻的fiber
        - return
            - 就是parent, return.child === self
    - fiber是什么时候产生的
        - 是在mount的过程中产生的, 一开始只有一个HostRoot, 是一个抽象的Node, 这个HostRoot下面会有一个根fiber, 调用这个根fiber的render方法, 能得到其返回的ReactElement, 对于这些ReactElements, 迭代下去就能得到fiber树
- 什么是reconcile(核对)
    - 核对就是通过比较旧的Fiber和新的由组件的render方法返回的ReactElement, 来得到新的Fiber, 并且构造effectTree的过程, 但是并不执行effectTree
    - 这个就是面试中俗称的react的diff算法
        - 参见[ReactChildFiber.js#reconcileChildFibers](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactChildFiber.js#L1293)
            - 如果是对象
                - 如果是Element
                - 如果是Portal
            - 如果是Number或者String
                - 是TextNode
            - 如果是Array/Iterator
                - 调用reconcileChildrenArray/Iterator, 实现基本一样
                - TODO: 具体细节没看, 但是主体是创建一个Map key 到 fiber, 这样打到复用child fiber的目的, 再加上一些对于最坏情况的优化.
            - 处理错误情况: 渲染结果是Function, undefined, 空Fragment
            - 其余情况视为空Children
        - 这里如果某个函数式组件是被memo, 且浅比较相等, 则他的render方法不会被调用, 进而跳过核对
- 什么是effectTree
    - 就是由reconcile这个过程得到的, 由fiber上的firstEffect开始, nextEffect构成的树, 表示应该执行的dom操作, 但是其实并不真的执行, 而是由commitEffect完成实际的执行
- 什么是passiveEffect


## ReactDOM.render中发生了什么

- performSyncWorkOnRoot
- workLoopSync
    - performUnitOfWork
        - beginWork
            - mountXXXComponent/updateXXXComponent
                - nextChildren = render()
            - reconcileChildren
                - 这个函数不是递归的
                    - 只管child, 别的由workloop管
                - FiberNode.child = new FiberNode()
- finishSyncRender
    - commitRoot
        - commitRootImpl
            - flushPassiveEffects
            - 这里注意了, 这里要开始计时, commit如果超时了, 会怎么样呢
            - startCommitTimer
            - remainingExpirationTime = Math.max(finishedWork.expirationTime, finishedWork.childExpirationTime)
            - 进入commit phase
                - 需要commit的fiber称为finishedWork
                - 进入commit phase 的标志是ReactCurrentOwner设为null
                - prepareForCommit
                    - 做一些准备工作, 比如
                        - 获取当前focus的元素的selectionRange (为啥?)
                        - disable掉事件(为啥?)
                - 创建一个指针 nextEffect 指向 finishedWork.firstEffect
                - commit phase分为多个阶段
                    - beforeMutation, 
                        - 是获取mutation之前的快照
                        - 包括下面2种
                            - Snapshot
                            - Passive
                    - mutation
                        - 包括:
                            - ContentReset
                            - Ref
                            - Placement | Update | Deletion | Hydrating
                                - 这里就是操作Host进行DOMNode操作的地方
                    - resetAfterCommit, 恢复prepareForCommit保存的状态
                    - 把workInProgress的fiber tree设为current
                    - layout effects
                        - 包括
                            - Update | Callback
                            - Ref
                - Scheduler.requestPaint()
- 关于Scheduler
    - 默认优先级
        - 只要不是在事件监听函数里都是同步的级别

## Suspense

Suspense一开始是作为跟React.lazy配合的code splitting方案, 然而当某些人发现其内使用的throw Promise机制可以用来载入数据的时候, 就开始变了.

- React.lazy
    - 只是创建一个特殊的ReactElement而已, 其type是一个Symbol
    - 其内部会有一个状态_status, 记录promise的状态
- 当react-reconciler的workLoop遇到一个LazyComponent, 在mountLazyComponent的时候, 如果其为pending, 则会throw这个Promise
    - 见 [ReactFiberLazyComponent.js](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiberLazyComponent.js) 和 [ReactFiberBeginWork.js](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiberBeginWork.js#L1112)
- workLoop外面的try catch会捕获到这个render phase的错误, 然后交给[handleError](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiberWorkLoop.js#L1279)处理
    - 如果发现这个是一个Promise(thenable), 则会沿着 fiber.return 往上一直找到一个Suspense, 然后把这个promise添加到suspense的updateQueue(是个Set)里面, 然后重新从这个Suspense渲染, 当然这里会得到一个fallback的Suspense.
    
