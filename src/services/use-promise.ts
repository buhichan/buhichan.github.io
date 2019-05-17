import { useState, useEffect } from 'react';
import * as React from 'react';

export function usePromise<T>(p:()=>Promise<T>,deps:any[]){
    const [value,setValue] = useState(null as T | null)
    const reload = React.useMemo(()=>()=>{
        p().then(setValue)
    },[])
    const [loading,setLoading] = useState(false)
    React.useEffect(()=>{
        let canceled = false
        setLoading(true)
        p().then(v=>{
            if(!canceled){
                setLoading(false)
                setValue(v)
            }
        }).catch(err=>{
            if(!canceled){
                setLoading(false)
            }
            throw err
        })
        return ()=>{
            canceled = true
        }
    },deps)
    return [value,reload,setValue,loading] as [null|T,()=>void,(t:T)=>void,boolean]
}