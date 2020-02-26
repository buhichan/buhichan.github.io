import * as React from "react"

type Props = {

}

export default function IIyoKoiyoCalculator (props:Props){
    const [result,setResult] = React.useState("")
    return <div>
        <label>输入一个数字</label>
        <input type="number" onChange={async e=>{
            const number = e.target.valueAsNumber
            const {iiyokoiyo_calculator} = await import("./114514")
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