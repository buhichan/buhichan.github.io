# 如何把静态网站放到IPFS上
今天尝试把一个九十年代的博客部署到[ipfs](https://ipfs.io)上, 其实比较简单, 就是做一个九十年代的博客, 然后用ipfs发布.
# 1. 弄一个网页
首先我们要开发一个纯静态网页. 那么先创建一个文件夹叫`my-ipfs-site`, cd进去, 然后使用python打开一个本地静态服务器
```
python -m SimpleHttpServer
```
然后用chrome打开localhost:8000, 打开devTools, 找到在Sources/FileSystem这个tab, 把刚才创建的my-ipfs-site的路径加入进来, 这样我就能直接用chrome做IDE了
## 1.1 es module in chrome
用react做一个九十年代的网站, 虽然90年代没有react, 但是这里为了以后维护方便所以引入react.
- chrome 从 61版本开始就原生支持了 es module, 因此我这里使用dev.jspm.io来引入react和react-dom

```tsx
//main.tsx
import React from "https://dev.jspm.io/react"
import ReactDOM from "https://dev.jspm.io/react-dom"
import Marked from "https://dev.jspm.io/marked"IPFS
```

## 1.2 marked
引入marked, 然后创建一个文件夹, 放一些markdown文件作为文章. 然后在main.tsx里, 使用marked渲染.

```html
<!--index.html-->
<script type="module" src="main.js" />
```
那么现在我们有一个纯静态的网页了, 就可以发布到ipfs上了

# 2. 获取hash
cd到静态网页的目录下, 然后使用`ipfs add -r .`获取这个网页的object hash.
```
added QmU4wMh1avbzdWoTTqPk6qy3m8453RMRjBDpBg4un1bN2f my_ipfs_site/declare.d.ts
added QmZFGr54YiKGinZpF3RF5ZvLzGcTaGyUWC1ursc89WKxDH my_ipfs_site/index.html
added QmYXHzijsQqZk6P8TyQo9zSm8skrVf8xx9a3dENcsRstAM my_ipfs_site/main.js
added QmcdFRih625Eca7HF4V3Z9pxJLmhgK6nc5yBNmBDHzPRru my_ipfs_site/main.tsx
added Qmf9c6PHaeXraVCRaXgfE3Ba1YSToqxgQUZ2UBLdAmMKEK my_ipfs_site/package.json
added QmVLEfTy4ZDMVvWvZ3x1iA5g3SgiQo3c49oSsTVErz3up8 my_ipfs_site/tsconfig.json
added QmXuaSkRRoNWSAon3qJXPwanjUgpshyosJ5DDPfeCGp9qz my_ipfs_site/yarn.lock
added QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn my_ipfs_site/node_modules
added QmPBudovn6HqfRWvpSxANiGWzyqZdFLd3uge8KLVX7VjRx my_ipfs_site
```

# 3. 发布
```
ipfs name publish QmWkbEJGtBWsgA2ia7qB6SskugHbSXEh6Res9WZkrpFTyJ
```
注意`QmWkbEJGtBWsgA2ia7qB6SskugHbSXEh6Res9WZkrpFTyJ`是上面最后获取到的文件夹的哈希. 这里会得到这样的返回:
```
Published to QmPBudovn6HqfRWvpSxANiGWzyqZdFLd3uge8KLVX7VjRx: /ipfs/QmWkbEJGtBWsgA2ia7qB6SskugHbSXEh6Res9WZkrpFTyJ
```
那么到这里我们就成功地把这个网站发布到IPFS的这个hash下面了:
```
/ipns/QmPBudovn6HqfRWvpSxANiGWzyqZdFLd3uge8KLVX7VjRx
```
# 如何验证呢?
打开ipfs节点: `ipfs daemon`, 然后访问`localhost:8000/ipns/QmPBudovn6HqfRWvpSxANiGWzyqZdFLd3uge8KLVX7VjRx` 注意, 这里的hash要替换成在第三步里获取到的hash

# DNSLink

我们可以使用DNSLink这个机制来把/ipns/my.domain/ 指向我们指定的一个/ipfs/xxxxxxxxxx地址, 这样会比ipfs name publish得到的地址快很多.

例如我本人控制了buhichan.xyz这个域名, 那么我可以在我的DNS服务商那里添加这么一条记录:

| 类型 | 名称 | 值 | TTL |
| --- |  --- | --- | --- |
| TXT | _dnslink.blog | dnslink=/ipfs/QmPBudovn6HqfRWvpSxANiGWzyqZdFLd3uge8KLVX7VjRx | 1小时 |

这样的话, 我就把 /ipns/blog.buhichan.xyz 指向了/ipfs/QmPBudovn6HqfRWvpSxANiGWzyqZdFLd3uge8KLVX7VjRx.

# 问题

ipfs获取一个object的速度太他妈慢了! 我不知道是我本地节点的问题还是什么, 但是我在我本地起的节点基本上只有我本地能访问到, 否则就是无限加载中, 并不能加载出来.