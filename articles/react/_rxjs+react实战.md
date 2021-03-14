
rxjs相信大家都听说过, 没听说过的可以看看他们官网, 是一个响应式编程的库, Rxjs跟react结合来用的人就比较少了, 这里专门用一个例子来举例看看如何使用rxjs替代redux此类的状态管理库来充当react等框架的model层. 下面假设读者具有了rxjs的基础知识, 对最基础的API, 例如subscribe和unsubscribe不做特别介绍.

# 重点

实际上在前端娱乐圈里已经流行了observable这个概念, 比如mobx和vue3都是基于observable这个概念的, 有可能给部分人造成一种印象, 以为reactive就是Proxy监听一下变化然后触发一下重新渲染, 确实observable就是这样的东西, 然而rxjs的强大之处并不在于这里, 在rxjs里面, 并没有魔法一样的Proxy, 只有冷冰冰的next(), 而rxjs的强大之处其实在于具有强大表达能力的operators.

rxjs当前版本包含了可以说让人眼花缭乱的静态方法和操作符(operators), 使得刚上手的人会感到有一定门槛, 但是其实我们常用的并不多. 下面通过一个例子来看看如何在实战中使用rxjs管理react的model层.

例子还是todoList, 视图层就用react.

首先我们需要一个把observable的状态同步到react组件的东西, 这个东西在redux里叫useSelector, 这里我们实现一个叫做useObservable的hook:

```ts
function useObservable<Value>(ob: Observable<Value>): Value | null
```

具体实现就当做作业了, 这个还是很好实现的, 注意要兼容concurrent mode, 并且当ob本身改变的时候需要取消原有订阅再订阅新ob.

然后我们就可以实现一个model了, 代码如下

```ts
// src/todo/service/api.ts
import { fromFetch } from "rxjs/fetch"
import { map, switchMap } from "rxjs/operators"

interface ITodoItem {
    id: number
}

export interface FetchTodoListParams {
    page: number
    pageSize: number
    search: string
}

function handleRequest<T=unknown>(request: Observable<Response>){
    return request.pipe(
        switchMap(x => x.json()),
        switchMap(handleError)
        map(x => x.data as T)
    )
}

const apiService = {
    // 这个代表了一切的‘读’的方法
    loadList(params: FetchTodoListParams) {
        return fromFetch("/todolist" + new URLSearchParams((params as unknown) as Record<string, string>).toString(), {
            method: "get",
        }).pipe(
            x=>handleRequest<TodoItem[]>(x)
        )
    },
    // 这个可以代表一切的‘写’的方法, 你可以脑补成增删改
    someAction(todoItemId: ITodoItem["id"]) {
        return fromFetch("/todolist/someAction", {
            method: "post",
            body: JSON.stringify(todoItemId),
        }).pipe(
            handleRequest
        )
    },
}

export default apiService
```

那么上面就是一个apiService, 这里为了方便省略了handleError的实现, 下面直接从TodoListModel里import这个service, 喜欢di之类的同学可以用自己喜欢的di框架注入服务.

```ts
// src/todo/model.ts
import apiService, {FetchTodoListParams} from "todo/service/api"
import { BehaviorSubject, combineLatest, Subject } from "rxjs"
import { map, publishReplay, refCount, startWith, debounceTime, switchMap, tap } from "rxjs/operators"

class TodoListModel {
    // 注意这个是私有的, 组件不需要关心这个.
    private listNeedsUpdate = new Subject()
    public pagination = new BehaviorSubject({
        page: 0,
        pageSize: 10,
    })
    public search = new BehaviorSubject("")
    //prettier-ignore
    public todoList = combineLatest([
        this.pagination,
        this.search.pipe(
            debounceTime(600)
        ), 
        this.listNeedsUpdate.pipe(
            startWith(null)
        )
    ]).pipe(
        switchMap(([pagination, search]) => {
            return apiService.loadList({
                ...pagination,
                search,
            })
        }),
        publishReplay(),
        refCount(),
    )
    public someAction(todoItemId: number) {
        return apiService
            .someAction(todoItemId)
            .pipe(
                tap(() => {
                    this.listNeedsUpdate.next()
                })
            )
            .toPromise()
    }
    public changePagination(page: number, pageSize: number){
        this.pagination.next({
            page,
            pageSize,   
        })
    }
    public changeSearch(search: string){
        this.search.next(search)
    }
}
```

然后我们的组件就可以在任何地方依赖这个服务了:

```tsx
export function ListView(){
    const list = useObservable(todoListModel.todoList)
    return <div>
        <List dataSource={list} renderItem={...} />
    </div>
}
export function TableView(){
    const list = useObservable(todoListModel.todoList)
    return <div>
        <Table dataSource={list} columns={...} />
    </div>
}
export function SearchView(){
    const pagination = useObservable(todoListModel.params)
    return <div>
        <Pagination page={pagination.page} pageSize={pagination.pageSize} onChange={(page, pageSize)=>{
            todoListModel.changeParams({
                page,
                pageSize
            })
        }}>
        <Search value={pagination.search} onSearch={newSearch=>{
            todoListModel.changeParams({
                search: newSearch
            })
        }} />
    </div>
}
```

# 为什么

下面我首先讲一下这里用到的每个操作符是什么, 为什么要这么写.

首先从apiService开始

## fromFetch
这个跟fetch api一模一样, 唯一的区别就是fetch api返回的是promise, 而fromFetch返回的是observable, 当observable被退订的时候, 会去调用abortControler的abort来取消这个请求.

## switchMap
它非常类似Array.prototype的flagMap, 以及Promise.prototype.then的一半作用. 其作用就是把嵌套的Observable摊平, 放在我们这里就是类似redux-saga的takeLatest, 当有新请求的时候取消仍然在跑的旧请求. 了解函数式编程的同学知道这个是monad的bind函数.

## map
它非常类似Array.prototype的map, 以及Promise.prototype.then的另一半作用. 其作用就是把Observable里的值转换成新的值, 这个可以说是最常用的操作符.

可以看出其实switchMap和map在这里就是then的作用.

然后是model.

## combineLatest (静态方法)
它类似Promise.all, 需要注意的是, 如果它的参数observable的其中一个迟迟不next的话, 它就没办法将数据传下去, 因此我们这里用了startWith, 其道理是讲得通的, 即使列表没有发生变化(发生变化这个事件被我们的needsUpdate代表了), 我们初始的时候也需要调用一次请求拿到数据.

## debounceTime
这个很好理解, 输入框需要debounce才能发出请求, 否则就会输入一个字母发一次请求.

## tap
它类似Array.prototype的forEach, 其作用在于执行副作用, 这里用于在someAction完成之后触发重新拉取数据

## **publishReplay** & **refCount** 重要!
这个是灵魂所在.

要讲清楚这个, 首先需要搞懂冷热observable的概念. 这个在网上能搜到很多说法, 并且对于rx新手来说往往难以理解, 我在这里用一套我自己总结的(可能过分简化的)方法来说明:

我们用Promise来类比, 如果Promise也有冷热的话, 就是:

```ts
let cold = ()=>{
    return new Promise(resolve=>setTimeout(resolve, 600))
}
let hot = new Promise(resolve=>setTimeout(resolve, 600))
```

也就是说, Observable的冷热就是 (我们先抛开rxjs不管, 讨论广义的observable):

```ts
let cold = ()=>多个可以订阅的值;
let hot = 多个可以订阅的值;
```

相信大家能注意到其区别了, 冷的observable, 对于每个订阅者来说会分别创建单独的数据流, 而热的observable是所有订阅者共享一个数据流.
冷的observable的例子就是API请求. 这一点能够从fromFetch和fetch的区别看出来.
    - 对于fetch来说, 当你调用fetch("/todo")的时候, 浏览器就会立刻发出请求.
        - 因此我们用fetch定义一个api调用会这么写: `const fetchTodo = ()=>fetch("/todo")`, 注意这是一个‘冷’的Promise
    - 如果是fromFetch, 则不会立刻发起请求, 而是在有人订阅的时候才会发出请求.
        - 因此我们用fromFetch定义一个api调用应该这么写: `const fetchTodo = fromFetch("/todo")`, 注意这个跟上面的‘冷’的Promise对应了
热的observable的例子就是按钮的点击事件, 按钮的点击事件并不会由于你订阅还是没有订阅而改变其数据流.

那冷和热跟publishReplay有什么关系呢?

首先, 对于todoList这个API来说, 我们是不喜欢每个对todoList的订阅都单独发出请求的, 而fromFetch这种冷的Observable就是这种行为, 所以我们需要把它变成热的, 也就是把不共享的, 冷的数据流, 变成共享的, 热的数据流. 所以我们需要publishXXX, rx里有publish, publishBehavior, publishLast, publishReplay等publish系列的操作符, 干的都是类似的事情, 那就是把冷的observable变成热的.
其次, 如果订阅状态的组件在请求完成之后才订阅, 我们希望它也能读取到请求结果, 因此我们需要数据流有重放机制, 在订阅发生的时候重放最近的一个值, 因此我们选择了publishReplay这个操作符.

这还没完, 如果我们仅仅是把publishReplay放到pipe里面的话, 我们发现下游订阅组件没有收到任何数据改变, 这是为什么呢? 

想想如果是你来实现一个把冷的Promise转换成热的Promise的函数, 你会怎么实现?

### 尝试1

```ts
let cold = ()=>{
    return new Promise(resolve=>setTimeout(resolve, 600))
}

function publish(cold){
    return cold()
}
```

这样类型上能说得通, 但是放到observable的世界里是不行的, 因为我们不能在publishXXX()进行冷热转换的时候就立刻运行冷observable的内部逻辑(上面的例子就是发出API请求). 所以再回到Promise的世界里来, 我们可以做到更好, 那就是在有then的时候才去运行cold

```ts
let cold = ()=>{
    return new Promise(resolve=>setTimeout(resolve, 600))
}

function publish(cold){
    let p
    function then(onresolve, onreject){
        if(!p){
            p = cold()
        }
        return p.then(resolve, onreject)
    }
    return {
        then,
        catch(onreject){
            return then(undefined, onreject)
        }
    }
}
```

把这种类比放到rxjs的世界来说, 就是在第一个订阅者来的时候, 去订阅我们的冷的observable, 然后后续的订阅者也共享这个数据流, 然后还能做到一点就是在最后一个订阅者退订的时候, 退订冷的observable. 这个恰恰就是refCount操作符所做的事情. 从名字上可以看出它是引用计数的意思, 因为这个行为非常类似有指针的语言对指针进行引用计数来gc的做法.

把publishReplay和refCount总结起来, 他们共同完成的事情就是: 
当第一个useObservable hook的作用运行的时候, 就去发出请求, 第二个以及第n个useObervable都共用这一份响应. 并且如果useObservable hook所在组件全都unmount了, 也就是引用变成了0了, 那就立刻调用abortController来取消这个不需要的请求.

如果用redux来做这个, 需要几行代码? 相信大家能看出其精简到令人发指的优点了.

另外一个好处就是完全解耦了模型和视图, 视图甚至不需要有一个“请求数据”的dispatch的副作用. 只需要声明对数据流本身的依赖. 而模型会在第一个依赖来临的时候自动填充状态, 并在依赖已经不被需要的时候立刻清除所有需要清理的副作用(例如AbortSignal.abort()).

## 附加题: 跟踪loading和error

我们可以实现这么一个custom operator来对请求的loading和error进行跟踪, 同样作为附加题来让大家实现:

```ts
import {OperatorFunction, ObservableInput} from "rxjs"

type TrackedResponse<R> = {
    loading: true
} | {
    loading: false,
    error: Error
} | {
    loading: false,
    data: R
}

function trackLoadingAndError<Params, Response>(request: (params: Params)=>ObservableInput<Response>): OperatorFunction<Params, TrackedResponse<Response>>
```

用这个操作符替换掉上面todoList的switchMap之后, 我们就得到了list数据的loading值和error, 并且此操作符可以在任何地方得到复用.
