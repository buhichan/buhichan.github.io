import * as React from "react"

type Props = {

}

const a = 4;

console.log(a)

export default function IIyoKoiyoCalculator (props:Props){
    const [result,setResult] = React.useState("")
    return <div>
        <p>数字论证工具 (这么臭的工具有存在的必要吗(半恼))</p>
        <input placeholder="输入一个数字" type="number" onChange={async e=>{
            const number = e.target.valueAsNumber
            const {iiyokoiyo_calculator} = await import("./pkg/iiyokoiyo_calculator")
            if(isFinite(number)){
                const res = iiyokoiyo_calculator(number)
                setResult(res ? `${number} = ${res}` : "114514的组合得不到这个数字")
            }else{
                setResult("")
            }
        }} />
        <div style={{marginTop:20}}>{result}</div>
    </div>
}