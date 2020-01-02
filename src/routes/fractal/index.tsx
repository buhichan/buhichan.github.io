import * as React from "react"
import RenderMarkdown from "../article/render-markdown";

type Props = {

}

const md = `
# 一些webgl2的想法💡

如果浏览器不支持webgl2, 需要换chrome.

---

半功利性的学图形和glsl, 才发现线代实在是太重要了, 一些上学的时候搞不懂的概念, 开始逐渐了解了有什么用途.
`

export default function FractalPages (props:Props){
    return <RenderMarkdown src={md} />
}