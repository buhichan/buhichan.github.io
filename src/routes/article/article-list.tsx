import * as React from "react";
import { Anchor } from "../../services/router";

type Articles = {
  [name: string]: string | Articles;
};

const articleList: Articles = {
  "使用E-Tag进行API的缓存": "etag-caching-of-restful-api",
  如何把一个静态网站放到IPFS上: "how-to-make-an-ipfs-static-site",
  造轮子还是不造轮子: "invent-wheel-or-not",
  "react fiber读书笔记": "explore-react-fiber",
  "rxjs vs redux": "rxjs-vs-redux",
  css布局系列: {
    包含块: "containing-block",
    "一句话搞明白块格式化上下文(BFC)": "block-formatting-context",
    一句话搞明白层叠上下文: "stacking-context",
    "display: grid的注意事项": "grid-layout",
  },
  响应式设计: "responsive-design",
};

export function renderArticles(articles: Articles = articleList) {
  return (
    <ul>
      {Object.keys(articles).map((title) => {
        const maybeSource = articles[title];
        return (
          <li key={title}>
            {typeof maybeSource === "object" ? (
              <>
                <h5>{title}</h5>
                <ul> {renderArticles(maybeSource)}</ul>
              </>
            ) : (
              <Anchor href={"/article?article=" + maybeSource}>{title}</Anchor>
            )}
          </li>
        );
      })}
    </ul>
  );
}
