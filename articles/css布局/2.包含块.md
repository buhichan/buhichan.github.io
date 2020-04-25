# Containing Block (包含块)

[包含块](https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block)也就是当height, top, bottom, right, left, width, padding, margin这些为百分比的时候, 其所比较的对象.
- 需要注意的是margin, padding为百分比时, 其对象总是包含块的宽, 而不是高, 而height, top则比较的对象是包含块的高.

<details>
    <summary>例子</summary>
    <iframe width=600 height=400 src="data:text/html;base64,PCFET0NUWVBFIGh0bWw+CjxodG1sIGxhbmc9ImVuIj4KPGhlYWQ+CiAgICA8bWV0YSBjaGFyc2V0PSJVVEYtOCI+CiAgICA8dGl0bGU+VGVzdDwvdGl0bGU+CjwvaGVhZD4KPHN0eWxlPgogICAgYm9keSB7CiAgICAgICAgbWFyZ2luOiAwOwogICAgfQogICAgLmNvbjF7CiAgICAgICAgd2lkdGg6IDUwMHB4OwogICAgICAgIGhlaWdodDogMzAwcHg7CiAgICAgICAgYmFja2dyb3VuZDogI2VlZTsKICAgICAgICBwYWRkaW5nOiAyMHB4OwogICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsKICAgIH0KCiAgICAuY29uMT4qOm50aC1jaGlsZCgxKXsKICAgICAgICBiYWNrZ3JvdW5kOiAjZjk5OwogICAgICAgIHdpZHRoOiAxMDAlOwogICAgICAgIC8qIG1hcmdpbi10b3A6IDUwJTsgKi8KICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7CiAgICAgICAgbGVmdDogMDsKICAgICAgICB0b3A6IDA7CiAgICAgICAgdG9wOiA1MCU7CiAgICB9CiAgICAuY29uMT4qOm50aC1jaGlsZCgyKXsKICAgICAgICBiYWNrZ3JvdW5kOiAjOWY5OwogICAgfQogICAgLmNvbjE+KjpudGgtY2hpbGQoMyl7CiAgICAgICAgYmFja2dyb3VuZDogIzk5ZjsKICAgIH0KPC9zdHlsZT4KPGJvZHk+CiAgICA8ZGl2IGNsYXNzPSJjb24xIj4KICAgICAgICA8ZGl2IGNsYXNzPSJiMSI+MTwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9ImIyIj4yPC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0iYjEiPjM8L2Rpdj4KICAgIDwvZGl2Pgo8L2JvZHk+CjwvaHRtbD4=" ></iframe>
</details>

---

## 如何识别一个元素的包含块?

下面列出的格式是: 

- 当需要识别的包含块的position为?时, 
    - 包含块是来自?元素的
    - padding box还是content box

优先级为从上往下

1. position: statis,relative,sticky
    - containing block:
        - 往上最近的display: (inline-)block
        - 或者创建格式化上下文的元素, 例如display: flex, table, grid
    - content box (padding内的部分)

2. position: absolute, fixed
    - containing block:
        - 往上最近的
            - transform, perspective, filter不为none的元素
            - will-channge为tranform, perspective, filter的元素
            - contain: paint
    - padding box (border内的部分)

3. position: fixed
    - containing block:
        - 视窗
    - padding box

4. position: absolute
    - containing block:
        - 最近的position不为static的元素
    - padding box