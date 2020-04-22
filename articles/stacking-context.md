# Stacking Context (层叠上下文)

几句话讲清楚层叠上下文

## 一句话
层叠上下文是用来比较z轴次序的概念, 只有在同一个层叠上下文中的元素才能直接决定z轴次序, 否则需要递归比较其父级层叠上下文的z轴次序

---

## 伪代码

``` js
function compareZIndex(a, b){
	if(a.stackingContext === b.stackingContext) {
		/* 按这个优先级比较, 从上到下依次为z轴的小到大
            1. background/border
            2. z-index < 0
            3. display: block
            4. float: xxx
            5. display: inline-block
            6. z-index: auto / 0
            7. z-index > 0
		*/
		const va = getIndex(a);
		const vb = getIndex(b);
		if (va!=vb){
			return va - vb
		}else{
			// 否则比较html元素在html中的次序, html在前的在下
			return a.htmlOrder - b.htmlOrder
		}
	} else {
		/* 如果不处于同一个层叠上下文, 则递归比较其所处的层叠上下文,
 			因为总有一个根节点 <html />, 所以函数是一定会返回的 */
		return compareZIndex(a.stackContext, b.stackingContext)
	}
}
```
### 伪代码的文字说明 

如果不在同一个层叠上下文中, 则比较其所处的层叠上下文.
如果在同一个层叠上下文中, 则按下列顺序比较

1. background/border
2. z-index < 0
3. display: block
4. float: xxx
5. display: inline-block
6. z-index: auto / 0
7. z-index > 0

如果这么比较仍然相等, 则比较两个元素在html中的次序

---

## 如何产生层叠上下文? 

下面这个名单具有时效性, 最新列表需要参见 https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context

1. 是 html 元素的时候
2. position: relative && z-index不为auto
3. position: absolute && z-index不为auto
4. position: fixed
5. position: sticky
6. 父元素的display属性值为flex|inline-flex|grid，自身z-index属性值不为auto，自身产生层叠上下文
7. -webkit-overflow-scrolling = "touch"
8. opacity < 1
9. mix-blend-mode != "normal"
10. transform, filter, perspective, clip-path, mask/mask-image/mask-border != "none"
11. isolation = "isolate"
12. will-change的值为任何可能产生堆叠上下文的属性名称
13. contain = "layout" | "paint"

