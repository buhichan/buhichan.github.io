# CSS流布局

*流布局里仅仅讨论display: block和display: inline的情况, 换言之, 不涉及flex和grid.*

参见[这里](https://drafts.csswg.org/css2/visuren.html#positioning-scheme)

> An element is called out of flow if it is floated, absolutely positioned, or is the root element. 
> 
> An element is called in-flow if it is not out-of-flow. 
> 
> The flow of an element A is the set consisting of A and all in-flow elements whose nearest out-of-flow ancestor is A.

---

## Flow有3种

- Normal Flow
    - Block Layout
        - BFC
    - Inline Layout
        - IFC
    - position: sticky

- Floats

- Absolute Positioning
    - position: absolute/fixed

---

## Display 属性

每一个盒模型都可以理解为有inner display type和outer display type

|       |   outer   |    inner   |
|-------|-----------|------------|
| block |   block   |   block    |
| inline|   inline  |   inline   |
|inline-block | inline | block |
| flex | block | flex |
| inline-flex | inline | flex |

---

## Float

float的元素首先被布局到它们原本应该被布局的地方, 然后被从文档流拿出 (out of flow), 然后尽量向左/右移动

### Clear

clear的含义在于在其左/右有float块的时候, 是否需要将此元素放置到float块之下 
- 如果clear的元素不是float的, 那么他的margin-top会被被clear的margin-bottom合并, 不论margin的大小, 如果是float的, 则margin不会合并


### "Clearfix" 
float的元素的高度不会被计算到父元素中, 因此只包含float元素的元素的高度为0, 这是在某些早起布局框架中经常出现的问题, 除非给父元素创建一个BFC, 常用的创建BFC的办法:


1. 给父元素的:after伪元素加上clear: both
2. 给父元素加上overflow: visible 之外的属性, 例如auto (clip不会创建BFC)
3. 给父元素加上display: flow-root  //这是最推荐的方法, 除了创建BFC之外什么都不做, 但是截止此时, 浏览器兼容性不好

</details>




---

## 格式化上下文 (formatting context)

### block formatting context (BFC)

- 每个元素从上到下排列
- 每个元素的外边距左边缘接触容器的内边距的左边缘 (如果容器具有direction: rtl 则是靠右)

### inline formatting context

- inline匿名盒子, 比如下面的123和789是2个匿名盒子, 匿名盒子继承父的样式, 并且其无法被CSS选择
```html
<span>
    123 
    <i>456</i>
    789
</span>
```

### flex formatting context

### grid formatting context