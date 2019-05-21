import {fromEvent} from "rxjs"


export function makeTimer(canvas:HTMLElement){
    let paused = false
    const sub = fromEvent(canvas,'dblclick').subscribe(()=>{
        paused = !paused
    })

    let start = Date.now()
    let current = start

    return {
        getTime(){
            return current - start
        },
        update(){
            if(paused){
                start = start + Date.now() - current
            }
            current = Date.now()
        },
        unsubscribe:()=>sub.unsubscribe()
    }
}