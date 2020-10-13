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
        - 有一些解决办法, 比如动态注册reducer, 把reducer跟相关业务放在一起, 但是这不是redux的本意
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
        - 要实现time travel比较困难, 需要记录每一步操作了哪个behavior subject.
    - 代码组织方法
        - group code by business logic
        - 属于同一辆车的零件放一起
    
# 为什么我要用rxjs代替redux来做状态管理

很多人(包括我)对redux的用法, 就跟设计者的想法不一致:
- 设计者的思路是
```js
function reducerA(state, action){
    switch (action.type){
        case "A":
            state = doB(state,action);
            return doA(state,action);
        case "C":
        case "B":
            return doB(state,action);
    }
}
```
也就是说, action与reducer是多对一的关系.
- 很多人(包括我)的用法是:
```js
const childReducers = {
    A:doA,
    B:doB,
    C:doC,
}
function reducer(state, action){
    return childReducer[action.type](state, action)
}
```
action与reducer基本上就是一对一. 如果是这样那么是可以进一步简化的. 
我的简化办法就是action替换为subject, 而处理逻辑的reducer替换为subject的监听函数. 在中后台前端业务开发的前提下, 这样能提高手动撸代码的开发体验.
其实怎么简化都无所谓的, 这个是整个开发体验中不重要的一部分, 这里只是其中一种办法.