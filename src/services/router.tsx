import {createBrowserHistory} from "history"
import { BehaviorSubject } from 'rxjs';
import { useObservable } from 'rehooker';
import * as React from "react"
import { usePromise } from "./use-promise";

export const history = createBrowserHistory()

export const location$ = new BehaviorSubject(history.location)

history.listen(v=>location$.next(v))

export function Route({path,children}:{path:RegExp,children:(params:RegExpMatchArray,loc:Location)=>Promise<React.ReactNode>}){
    const location = useObservable(location$)
    const [Component] = usePromise(async ()=>{
        const match = location ? location.pathname.match(path) : null
        return match ? children(match,location) : null
     },[location])
    return <>
        {Component}
    </>
}