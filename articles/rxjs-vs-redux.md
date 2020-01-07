# Rxjs vs Redux之我见

Redux是react的de facto的状态管理库, 那rxjs也可以用来管理状态, 二者之间有什么异同? 我的想法⬇️

- Redux
    - 概念
        - store
        - action
    - 一个应用有一个全局的store
    - dispatch之后, 触发所有的监听函数, 每个监听函数再执行一些diff逻辑, 例如connect的mapStateToProps
        - 多余
            - 你说我一个A组件的监听函数, 你B组件更新了状态, 我们关注的状态完全没有交叉, 为什么我也要diff下?
        - 如果要提高diff效率, 需要引入immutable
    - 全局状态
        - 带来的好处是可以很方便的操作状态 
            - 比如time travel
            - 出bug的时候可以记录当前状态用于之后复现
        - 没有封装
            - 任何组件只要依赖一个状态就能依赖全局状态
    - 代码组织方法
        - group code by kind, not by business logic
        - 就像你有两辆车, 但是你把轮子跟轮子(action)放在一个房间, 底盘跟底盘(reducer)放在另一个房间, 方向盘又放另外的房间
- Rxjs
    - 概念
        - behavior subject
        - next
    - 一个应用可以有任意多个behavior subject
    - 可以细分到任意粒度
        - 有依赖的状态之间也可以用rx操作符建立依赖
    - next之后, 只触发对此状态感兴趣的监听函数
        - 不再需要引入diff逻辑, 只要监听函数被触发, 直接渲染就可以了
        - 因为不需要diff所以也不需要引入immutable
    - 各个组件和服务的状态分离
        - 基本不能time travel.
    - 代码组织方法
        - group code by business logic
        - 属于同一辆车的零件放一起
    
