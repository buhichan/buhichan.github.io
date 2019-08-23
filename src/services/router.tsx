import { Location, createHashHistory} from "history"
import { BehaviorSubject } from 'rxjs';
import { useObservable } from 'rehooker';
import * as React from "react"
import { usePromise } from "./use-promise";

export const history = createHashHistory()

export const location$ = new BehaviorSubject(history.location)

history.listen(v=>location$.next(v))

export function Route({path,children}:{path:string,children:()=>Promise<React.ReactNode>}){
    const location = useObservable(location$) || history.location
    const [Component] = usePromise(async ()=>{
        const matched = location.pathname === path
        return matched ? children() : null
     },[location])
    return <>
        {Component}
    </>
}

export function useSearchParams(){
    const location = useObservable(location$) || history.location
    return React.useMemo(()=>new URLSearchParams(location.search),[location.search]) 
}

export function Anchor(props:React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>){
    return <a {...props} onClick={(e)=>{
        e.preventDefault()
        history.push(props.href)
    }}>{props.children}</a>
}