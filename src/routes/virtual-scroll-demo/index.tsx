import * as React from "react"
import InfiniteScroll from "react-infinite-virtual-scroll"

export default ()=>{
    const dataSource = React.useMemo(()=>{
        return async function *getData(){
            let total = 1000
            let page = 0
            while(page * 20 < total){
                page ++
                console.log("loadData")
                yield new Array(20).fill(0).map((_,i)=>({
                    id:page * 20 + i,
                    height: Math.random() * 10 + 20,
                    name:"No."+ (page * 20 + i)
                }))
            }
        }
    },[])
    console.log(InfiniteScroll)
    return <InfiniteScroll dataSource={dataSource} style={{height:200}}>
        {
            data=>{
                return data.map(x=>{
                    return <div key={x.id} style={{height:x.height}}>
                        {`${x.name}(${x.height.toFixed(2)}px height)`}
                    </div>
                })
            }
        }
    </InfiniteScroll> 
}