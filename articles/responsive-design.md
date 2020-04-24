# 响应式设计

响应式设计中需要用到的, media query的方法.

## css media query

```css
@media (min-width: 600px){

}
```


## window.matchMedia

```js
const mql = window.matchMedia("(min-width: 600px)")

const update = ()=>{
    if(mql.matches){
        // >= 600px
    }else{
        // < 600px
    }
}

update();

mql.addListener(update)
```

## link, style, picture>source

```html
<picture>
    <source srcset="/media/examples/surfer-240-200.jpg" media="(min-width: 800px)">
    <img src="/media/examples/painted-hand-298-332.jpg" />
</picture>
<link media="(min-width: 800px)"/>
<style media="(min-width: 800px)"></style>
```
