
用了那么久的Promise的你最后会发现, 使用Promise来表达一个http上的api资源, 就完全是错误的, 以下是目前为止我觉得比较接近正确的办法:

至于为什么, 提示: Promise没法cancel, 不要给我提什么bluebird, 规范里没有, 怎么实现都是有瑕疵的.

Angular领先前端娱乐圈五年都是少的.

```tsx
import { fromFetch } from "rxjs/fetch"
import { switchMap } from "rxjs/operators"
import * as React from "react"
/**
 * @link useObservables https://gist.github.com/buhichan/d147fcd34abb2b37240d71fa8b867264
 * @link collectResponse https://gist.github.com/buhichan/bdb722b71266958d512ebf5a2b5db063
 */
import { useObservables, collectResponse } from "???????"
import { of } from "rxjs"
import { Spin, Alert } from "antd"

const fetchJson = of(null).pipe(
    collectResponse(() => {
        return fromFetch("../moc/list.json").pipe(switchMap(x => x.json() as Promise<{ name: string }[]>))
    })
)

export default function () {
    const [res] = useObservables(fetchJson)

    return (
        <div>
            {res?.error ? <Alert type="error" message={res.error} /> : res?.loading ? <Spin /> : res?.value?.map(x => <span key={x.name}>{x.name}</span>)}
        </div>
    )
}
```