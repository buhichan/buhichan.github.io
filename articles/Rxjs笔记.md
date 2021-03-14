# Common Pitfalls

## 什么时候用 pipe 什么时候用 subscribe?

## 什么时候需要手动 unsubscribe?

## maximum call stack size exceeded?

## toPromise 了却没有发生任何事情?

# 冷热 Observable

一些 rxjs 文章上有这样的说法, 说 Rxjs 的 Observable 默认是“冷的”, 可以这么粗略地理解: 我们假设 Promise 也有冷热的话, 那么...

1. 冷的 Promise 就是 `const cold = ()=>Promise<T>`
    - 使用者需要进行一个调用`cold()`才能开始订阅
        - Observable 那边对应`subscribe()`
    - 每个使用者独享自己的订阅逻辑
2. 热的 Promise 就是 `const hot = Promise<T>`
    - 不需要`hot()`, 直接就能订阅
    - 所有订阅者共享一个状态

## 常见的冷 Observable

-   http 响应可以是冷的 (每个订阅的地方单独发请求, 不过这样就很可能是重复请求)
-   定时器

## 常见的热 Observable

-   浏览器中人点击按钮的事件
-   http 响应可以是热的
-   websocket 事件
-   文本框的值
-   rxjs 的`*****Subject`

# 使用 Observable 表达 HttpAPI

现在说下怎么用 Observable 来表达一个异步的资源, 例如 Http API. 我用 React 来举例, 并且假设我们已经实现了一个 hook 用来订阅 Observable, React 的同学应该很容易实现这个.

```tsx
function useObservable<T>(ob: BehaviorSubject<T>): T
function useObservable<T>(ob: Observable<T>): T | null {
    //...
}
```

## 尝试 1: 使用冷的 Observable

由于每个冷 Observable 的被订阅时候的逻辑都是独立的, 所以如果我们的 http 请求等昂贵的 Observable 都互相独立的话, 就会造成重复发多个请求, 比如看下面这个在 React 中使用的例子:

```tsx
const someApi = fromFetch("http://www.baidu.com")

function UseCase1() {
    const data = useObservable(someApi)
    return <div>{data}</div>
}

function UseCase2() {
    const data = useObservable(someApi)
    return <div>{data}</div>
}

function App() {
    return (
        <>
            <UseCase1 />
            <UseCase2 />
        </>
    )
}
```

在上面这个例子里面, someApi 会被触发 2 次, 我们知道冷的 Observable 就好像`()=>Promise`, 因此 someApi 会被触发 2 次, 我们现在不想要它触发 2 次, 可以试试改成热的 Observable, 就比如`BehaviorSubject`.

## 尝试 2: 用热的 Observable

```tsx
const someApi = new BehaviorSubject()

function UseCase1() {
    const data = useObservable(someApi)
    return <div>{data}</div>
}

function UseCase2() {
    const data = useObservable(someApi)
    return <div>{data}</div>
}

function App() {
    useEffect(() => {
        const sub = fromFetch("http://www.baidu.com").subscribe(someApi)
        return () => {
            sub.unsubscribe()
        }
    }, [])

    return (
        <>
            <UseCase1 />
            <UseCase2 />
        </>
    )
}
```

这个例子的问题是, 为什么 App 里需要显式地去请求资源然后填充到 BehaviorSubject 里呢? App 怎么知道下面有需要 someApi 的数据的订阅呢? 它不知道, 所以得靠程序员的自觉, 所有靠自觉的代码都是不可靠的. 我们可以改成订阅的时候发出请求的第三种办法, 也是我最后想出来的办法.

## 尝试 3: 用冷的 Observable, 然后把它变热

```tsx
const someApi = fromFetch("http://www.baidu.com").pipe(publishReplay(1), refCount(1))

function UseCase1() {
    const data = useObservable(someApi)
    return <div>{data}</div>
}

function UseCase2() {
    const data = useObservable(someApi)
    return <div>{data}</div>
}

function App() {
    return (
        <>
            <UseCase1 />
            <UseCase2 />
        </>
    )
}
```

这个代码就达到了订阅的时候发出请求的目的, 并且只会产生 1 次 Http 请求, 更加有意思的是, 如果 App 这个组件在 mount 之后立刻就 unmount 了, 那么`useObservable`如果实现得正确的话, 这个包裹 Http 请求的`Observable`会被自动退订, Http 请求的退订呢, 就是体现成了一个`AbortController`的`.abort()`. 请求能够被自动取消. 如果换成用普通的`Promise`链来表示异步资源的话, 这种退订取消是很难做到的.

那么, 为什么加上这 2 个操作符 `publishReplay(1), refCount()` 就能达到这个目的呢?

首先看第一个`publishReplay(1)`, 假设把它的源码稍微那么精简一下 (去掉现在暂时不讨论的东西), 我们能得到下面这个, 可以看到它只是调用了`multicast`, 就是多播, 多播到一个`ReplaySubject`里面去.

```ts
export function publishReplay<T, R>(bufferSize?: number): UnaryFunction<Observable<T>, ConnectableObservable<R>> {
    const subject = new ReplaySubject<T>(bufferSize)
    return multicast(() => subject)
}
```

那么就再来看看`multicast`的实现, 同样我故意精简掉了一些代码:

```ts
export function multicast<T, R>(subjectOrSubjectFactory: () => Subject<T>): OperatorFunction<T, R> {
    return (source: Observable<T>) => {
        const connectable = new ConnectableObservable(source, subjectFactory)
        connectable.source = source
        connectable.subjectFactory = subjectFactory
        return connectable
    }
}
```

可以看到, “多播”这个操作符实际上是创建了一个`ConnectableObservable`, 这是一个 Observable 的子类, 它跟 Observable 的区别在于它有一个内部的 Subject 作为来源, 然后有一个方法叫`connect`, 这个`connect`做的事情是, 当它第一次被调用的时候, 它会去订阅自己内部这个 Subject, 这样把 Subject 里的事件往下游排放, 不调`connect`的时候它就什么也不做. 为什么要有这个 connect 这一步呢? 因为如果 ConnectableObservable 的实现是自动去订阅内部 Subject 的话, 那上游的订阅逻辑就直接被触发了, 在我们例子里就是创建 Observable 的时候就直接开始 Http 请求了, 这不是我们想要的.

因此, `publishReplay(1)`的意思就是, 创建一个`ReplaySubject(1)`, 这个就是一个当被订阅的时候会自动播放最后一个值的`Subject`; 然后创建一个`ConnectableObservable`, 它的作用是, 当它的`connect`被调用的时候, 订阅内部的`Subject`, 这里达到的是多播的目的, 冷的 Observable 多播之后, 就能够使得上游的 Observable 的订阅逻辑只触发一次了. 订阅逻辑可以理解为`new Observable(func)`的时候的 func 这个函数的逻辑加上后面所有的操作符的逻辑.

然后问题就来了, 谁来触发`connect`呢? 其实就是`refCount`, 它的作用是, 在自己被订阅的时候, 如果是从 0 个订阅到 1 个订阅, 则调用其源的`connect`, 在自己被退订的时候, 如果是从 1 个订阅到 0 个订阅, 则调用其源 ConnectableObservable 的`disconnect`.

# 常用模式

## 增删改查

<details> 
<summary>rxjs 增删改查</summary>

这算 MVVM 吗? 算 VM 还是 M? 我也不懂, 求教.

```ts
class ListModel<T> {
    query = new BehaviorSubject({})
    private readNeedsUpdate = new Subject()
    read = combineLatest([
        this.readNeedsUpdate.pipe(
            startWith(null) //第一次订阅的时候需要直接进行一次reload,
        ),
        this.query,
    ]).pipe(
        switchMap(([_, query]) => {
            return fromFetch("/some/api" + new URLSearchParams(query).toString(), {
                method: "get",
            }).pipe(map(x => x.DataSet))
        })
    )
    update(payload) {
        return fromFetch("/some/api", {
            method: "put",
            body: JSON.stringify(payload),
        }).pipe(
            tap(() => {
                this.readNeedsUpdate.next()
            })
        )
    }
    delete(query) {
        return fromFetch("/some/api" + new URLSearchParams(query).toString(), {
            method: "delete",
        }).pipe(
            tap(() => {
                this.readNeedsUpdate.next()
            })
        )
    }
    create(payload) {
        return fromFetch("/some/api", {
            method: "post",
            body: JSON.stringify(payload),
        }).pipe(
            tap(() => {
                this.readNeedsUpdate.next()
            })
        )
    }
    //除了crud以外还是可以有其他的方法
}
```

</details>

---

## 轮询

```typescript
const params$ = new Subject()

const response = params$.pipe(
    startWith({}), //初始请求一次
    switchMap(params => {
        return fromFetch(URL, {
            body: JSON.stringify(params),
        }).pipe(
            repeatWhen(completed => {
                //使用repeatWhen可以只在请求成功之后再发出请求
                return delay(POLL_INTERVAL)(completed)
            })
        )
    })
)
```
