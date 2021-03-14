import App from "./editor"
import React, { useState } from "react"

export default function SlatejsCollabo() {
    const [open, setOpen] = useState(false)

    return (
        <div>
            <div>基本上就是参考了网上的一些讨论实现了富文本多人同时编辑的问题</div>
            <div>
                参考过的资料:
                <ul>
                    <li>
                        <a href="https://github.com/ianstormtaylor/slate/issues/259">https://github.com/ianstormtaylor/slate/issues/259</a>
                    </li>
                    <li>
                        <a href="http://confreaks.tv/videos/railsconf2018-building-a-collaborative-text-editor">
                            http://confreaks.tv/videos/railsconf2018-building-a-collaborative-text-editor
                        </a>
                    </li>
                    <li>
                        <a href="https://arxiv.org/pdf/1810.02137.pdf">https://arxiv.org/pdf/1810.02137.pdf</a>
                    </li>
                </ul>
            </div>
            <div>
                本来是觉得想用rtc和crdt实现p2p的, 发现比较困难, 先实现一个有中心的, 中心就是第一个进入房间的人, 他的编辑器是唯一真相, 其他人只是在上面申请提交,
                这个人退房了就会失效, 其实应该是一个服务器来充当中心的. 不过后面想借鉴帧同步和选举算法看能不能选出新primary来实现不需要服务器.
            </div>
            <div>
                这里是<a href="https://github.com/buhichan/buhichan.github.io/tree/master/src/routes/demos/slate-collabo/src">源码</a>
            </div>
            {(open && <App />) || (
                <>
                    <div>
                        要看demo, 得先点击左上小锁图标{">"}网站设置{">"}不安全内容{">"}允许, 因为我没有证书的域名, 不然就跑不起来的.
                    </div>
                    <button
                        onClick={() => {
                            setOpen(true)
                        }}
                    >
                        设置好了
                    </button>
                </>
            )}
        </div>
    )
}
