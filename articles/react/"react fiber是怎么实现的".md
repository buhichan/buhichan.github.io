
现在, 即使招的只是个增删改查仔, 有的面试的时候喜欢问一些知名库的内部实现细节, 非常的不讲武德, 这好吗? 这不好.

特别是前端娱乐圈里面, 特别是react, 一上来就喜欢问, 你知道react的fiber是怎么实现的吗.

一般讲道理的能听到时间切片, 那就够了吧, 有的人偏偏要追问: 你知道调用了浏览器的哪个API吗?

这个时候如果说不知道, 那面试官会得意洋洋的告诉你, 是用了requestIdleCallback(ric), 潜台词: 厉害吧, 不知道吧哈哈哈.

react的fiber其实从requestAnimationFrame(raf)然后到ric改成了window.postMessage最后到现在变成了MessageChannel.

下面整理了一些相关pr.

## raf + requestIdleCallback

react fiber第一版 (16.0.0)就是这么实现的, raf, 然后在raf的回调里调用ric.

## raf + window.postMessage

然后因为ric的兼容性有问题, 所以给[改成了window.postMessage](https://github.com/facebook/react/pull/8833)

[#13720](https://github.com/facebook/react/pull/13720)
[#13785](https://github.com/facebook/react/pull/13785)
[#14025](https://github.com/facebook/react/pull/14025)

## raf + MessageChannel

window.postMessage有一个缺点就是如果其他代码在window上监听了message事件, 那react的调用也会触发这些listener, 带来潜在性能问题. [看这个](https://github.com/facebook/react/pull/14234)

所以就改成了造一个MessageChannel, 然后一个port是调度回调, 另一个port执行回调.

可能大家跟我一样有个疑惑就是, 你ric的兼容性都不行, 那MessageChannel这种听都没听说过的API还能用? 其实如果MessageChannel不存在那还是会fallback到window.postMessage

## MessageChannel

之前的实现都使用了raf, 来跟浏览器的刷新周期对齐, 并且每帧只yield1次, [不过后来扔掉了](https://github.com/facebook/react/pull/16212), 变成了调用MessagePort, 一帧可以yield多次.

然后[还用了小根堆](https://github.com/facebook/react/pull/16245)

后来又继续进行了优化, 在yield之前会检查当前是否有需要浏览器主进程立刻执行的任务, 如果有才会yield, 如果没有则会继续到maxYieldInterval才会yield. 怎么判断有没有浏览器需要立刻执行的任务呢? 这种任务只有2类, 一种是浏览器需要重绘, 第二种是存在用户事件

- 浏览器需要重绘
    - 因为每帧都至少yield一次所以不需要检查这个 (由maxYieldInterval保证)
- 是否存在用户事件
    - [navigator.scheduling.isInputPending()](https://github.com/WICG/is-input-pending)

# fiber是不是过优化

可以看[这个issue](https://github.com/vuejs/rfcs/issues/89)里, yyx说的很对.