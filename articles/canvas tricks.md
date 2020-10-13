

# 使用多个canvas来模拟多个图层

- 好处: 减少一次重新绘图的成本, 可以只绘制有变化的图层/canvas
    - 游戏当中也常用此技巧
- 坏处: 不同的canvas之间无法使用 globalCompositeOperation 等操作来blend了, 因为只能在相同的canvas内才有效