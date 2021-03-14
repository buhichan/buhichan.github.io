import App from "./editor"
import React, { useState } from "react"

export default function SlatejsCollabo() {

    const [open, setOpen] = useState(false)

    return <div>
            {open && <App /> || <>
            <div>要看demo, 得先点击左上小锁图标>网站设置>不安全内容>允许, 因为我没有证书的域名, 不然就跑不起来的.</div>
            <button onClick={()=>{
                setOpen(true)
            }}>设置好了</button>
        </>}
    </div>
}
