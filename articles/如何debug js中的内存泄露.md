
一般来说, 分为2种情况, 浏览器和nodejs, 浏览器有多种环境, 但是这里用chrome举例, 其余浏览器也有对应的工具.

我遇到一位同事写了一段代码, 在某种边际条件下, 会不停创建一个永远不会resolve的promise, 会不会引起内存泄露呢? 因为原代码中没有对创建的promise的引用, 所以猜测是不会, 测试之后印证了这个猜测.

## Chrome 83

首先是到memory tab

需要自己使用devtool的memory tab查看内存占用情况, 操作顺序是:

1. 打开页面, 打开devtoll, 切换到memory页面
2. gc (点击小垃圾桶按钮)
3. 点击圆圈, 截取js堆快照, 这个可以截取当前js中没有被回收的对象
4. 进行有内存泄露嫌疑的操作
5. 再次截取js堆快照
6. 从右上菜单中选择: Objects allowcated between Snapshot 1 and Shapshot 2
7. 右边结果页现在就是 有内存泄露嫌疑的操作 进行的时间段中留存在js堆内而无法被回收的对象, 点击每种分类可以查看其详情.

```html
<button onclick="foo()">click me</button>
<script>
    function foo(){
    for(let i=0;i<10000;i++){
        let m = new Promise((resolve)=>{
            if(a > 10){
            resolve()
            }
        }).then(console.log)
    }
</script>
```

## Node 12

nodejs的就比较粗糙了, 因为控制权比较大, 所以可以直接打印某操作前后的内存变化.

`node --expose-gc test.js`

```js
console.log(process.memoryUsage())

let a = 0;


for(let j=0;j<40;j++){
    for(let i=0;i<10000;i++){
        let m = new Promise((resolve)=>{
            if(a > 10){
            resolve()
            }
        }).then(console.log)
    }

    global.gc()
    console.log(process.memoryUsage())
}
```

# 总结
上面测试了一下, 如果全局变量没有引用promise, 则promise即使有传入回调, 也是可以被回收的. 上面只是一种js内存泄露的定位方法.