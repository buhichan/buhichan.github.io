
# display: grid

## 基础
https://css-tricks.com/snippets/css/complete-guide-grid/

## 注意事项(坑)

### auto nameing lines
当使用grid-template-areas 给area命名之后, area的column和row方向上的边界线会被自动命名: someareaname-start, someareaname-end

### containing block
如果Grid容器为一个containing block (指position为非static), 则对于绝对定位的grid item, 其containing block并不是容器, 而是其所占据的grid area, 也就是说其top, left, bottom, right, width, height如果是百分比, 是相对于其area而言的.