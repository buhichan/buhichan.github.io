import { Location, createHashHistory} from "history"
import { BehaviorSubject } from 'rxjs';
import { useObservable } from 'rehooker';
import * as React from "react"
import { usePromise } from "./use-promise";

export const history = createHashHistory()

export const location$ = new BehaviorSubject(history.location)

history.listen(v=>location$.next(v))

export function Route({path,component:Component,fallback}:{path:string,fallback?:React.ReactNode,component:React.ExoticComponent}){
    const location = useObservable(location$) || history.location
    const matched = location.pathname === path
    return matched ? <React.Suspense fallback={fallback || null}>
        <Component />
    </React.Suspense> : null
}

export function useSearchParams(){
    const location = useObservable(location$) || history.location
    return React.useMemo(()=>new URLSearchParams(location.search),[location.search]) 
}

export function Anchor(props:React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>){
    return <a {...props} onClick={(e)=>{
        e.preventDefault()
        if(props.href.startsWith("http")){
            window.open(props.href, props.target || "_blank")
        }else{
            history.push(props.href)
        }
    }}>{props.children}</a>
}