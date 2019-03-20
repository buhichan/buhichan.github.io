# 一些前端面试题

下面是一套我经常用的前端面试题, 随时更新中...

---
- 介绍一下以前做过的项目 (?/10分)
- XSS是什么? 如何防备?
- css的题目
    - position的三个取值
    - flex: 1 1 20px 是什么意思 (5分)
    - 如何实现让一个元素3s内从红到蓝到绿渐变动画 (5分)
- js的题目(时间不够)
    - Access-Control-Allow-Credentials 是什么作用 (5分)
    - promise
        - `Promise.resolve(new Error(1)).then(()=>{throw 2}).then(()=>3).catch(console.log)` 会打印出什么 (5分)
    - cookie session localStorage区别 (6分) ( 2 1 1 1 )
    - 假设我在a.foo.com 运行如下代码 ( 5分 )
        - `document.cookie = "key=value"`
        - 在b.foo.com运行 `document.cookie.includes("key=value")` 是什么结果 (false) (2分)
        - 如何修改第一步运行的代码, 才能让第二步能获取这个cookie? (3分) <!-- document.cookie="key=value; domain=.foo.com" -->
    - filter 和 reduce 分别是几个参数 返回什么 ( 20分 )
- html
    - dom事件冒泡的机制中, 捕获和冒泡是什么意思 (5分)
    - 如何在事件冒泡过程中阻止事件冒泡 (5分)
    - script标签放在html的那个部分最好为什么, 有什么替代方法 (5 分)
- js的题目(时间够)
    - 简单: 实现deepClone
    - 中等: 加油问题 https://leetcode-cn.com/problems/minimum-number-of-refueling-stops/description/
    - 困难: https://leetcode.com/problems/ipo/description/ (20分)
    <!-- ```js
        var findMaximizedCapital = function(k, W, Profits, Capital) {
            const indexes = Profits.map((_,i)=>i).sort((ia,ib)=>Profits[ib]-Profits[ia])
            while(k>0){
                const chosen = indexes.findIndex(i=>Capital[i] <= W)
    -(chosen === -1)
                    return W
                W = W+Profits[indexes[chosen]]
    -dexes.splice(chosen,1)
                k--
            }
            return W
        }
    ``` -->

# 问题
没有由浅入深