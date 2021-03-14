


```ts

type Subscription = {
    unsubscribe: ()=>void
}

interface Observable<V> {
    subscribe(ob: Observer<V>): Subscription
}

interface Observer<V> {
    next(v:V):void,
    complete():void,
    error(err: unknown):void
}

interface Subject extends Observer<V>, Observable<V> {

}

type Operator<V1, V2> = (ob: Observable<V1>) => Observable<V2>

```

# implement redux

```ts
type Dispatch<A> = A

function createStore<S, A>(
    reducer: (oldS: S, action: A)=>S, 
    initialState:S,
){
    let curState:S = initialState
    const actions = new Subject()
    const state = actions.pipe(
        scan(reducer, initialState),
        tap((s)=>{
            curState = s
        })
    )

    return {
        dispatch(a: A){
            actions.next(a)
        },
        getState(){
            return curState
        },
        subscribe(callback: (s:S)=>void){
            const sub = state.subscribe(callback)
            return ()=>sub.unsubscribe()
        },
    }
}

```