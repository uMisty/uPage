# uPage

基于 Vue 3、TypeScript 和 Vite 的可配置个人主页，按照 [Figma 桌面与移动端设计](https://www.figma.com/design/W1YzNgkM2X2TH9enCZeS8X?node-id=3-2) 实现。暖白、炭黑与钴蓝，配合大字、原创桌面插画、主推作品、文章列表与日常兴趣。

## 本地运行

需要 Node.js 22.18+（推荐 Node.js 24 LTS）。

```sh
npm install
npm run dev
```

打开终端显示的地址。开发服务同时提供 RSS 接口，无需另起后端。

```sh
npm run build       # 类型检查并构建到 dist/
npm run preview     # 本地检查构建产物（包含 RSS 接口）
npm start           # 生产 Node 服务，默认 127.0.0.1:3000
```

生产服务支持 `HOST`、`PORT` 环境变量；容器部署可设置 `HOST=0.0.0.0`。建议通过反向代理提供 HTTPS。运行 `npm start` 需要保留 `server/`、`shared/`、`dist/`、`package.json` 和运行依赖。本项目未执行线上部署。

## 修改内容

编辑 **[public/site.config.json](public/site.config.json)**，刷新即可生效。JSON Schema 提供编辑器提示，启动时还会校验配置并显示具体错误字段。源码中的类型定义位于 `shared/config.ts`，修改结构后运行 `npm run schema` 更新提示。

| 配置项 | 内容 |
| --- | --- |
| `site` | 页面标题、描述、语言、页脚与页脚链接 |
| `theme` | 背景、文字、辅助文字、强调色、分隔线、工具区和浅色背景 |
| `profile` | 姓名、后缀、介绍、简介、座右铭、首屏图片、按钮文案 |
| `sections` | 栏目眉题、标题、介绍和“全部项目”链接 |
| `labels` | 项目按钮与 RSS 状态文案 |
| `projects` | 项目介绍、封面、标签、发布日期及独立 Demo / GitHub 链接 |
| `blog` | RSS 地址、博客首页、展示数量、缓存时间和读取方式 |
| `now` | 近况开关、标题、条目和更新文字 |
| `toolGroups` | 工具分类、名称、用途、图标或文字缩写、可选链接 |
| `interests` | 兴趣名称、介绍和插画 |
| `contact` | 联系开关、桌面/移动文案和邮箱 |

自定义图片放在 `public/assets/`，使用 `/assets/your-image.webp`，也支持完整 HTTP(S) 图片地址。已有 19 份设计源素材可直接复用，支持图片替代文字。项目的 `image`、工具的 `icon` 和兴趣的 `image` 都可留空；工具无图标时显示 `mark` 或名称前两个字符。

项目、兴趣或全部工具为空时隐藏对应区块；空工具分类不会显示。`blog.enabled`、`now.enabled`、`contact.enabled` 可独立关闭。移动端兴趣为两列，桌面端三列；工具和项目随内容自然向下排列。

主推作品优先从 `featured: true` 中选择发布日期最新的一项；没有标记则从所有作品中选最新的一项。日期无效视为未提供，同日期保持输入顺序，全部无日期时使用第一项。其他作品保持原有顺序。Demo 和 GitHub 独立显示，缺少链接不会生成空链接。

## RSS 订阅

尚未设置真实博客，默认 `/feed.xml` 是本地示例 RSS，展示设计中的三篇虚构文章。它经过与真实订阅相同的解析链路，页面没有硬编码文章列表。正式使用时修改：

```json
{
  "blog": {
    "enabled": true,
    "url": "https://your-blog.example",
    "feedUrl": "https://your-blog.example/feed.xml",
    "mode": "server",
    "limit": 3,
    "cacheMinutes": 10,
    "showReadingTime": true,
    "defaultCategory": "随笔"
  }
}
```

- 默认 `server`：浏览器调用同源 `/api/feed`，服务端读取配置中的唯一订阅地址，避免博客 RSS 跨域问题。接口不接受访客传入的代理地址。
- 支持 RSS 2.0、RSS 1.0 / RDF 和 Atom；按发布时间倒序、按链接去重，然后截取 `limit` 篇（1–20）。没有日期的文章排在有日期的文章后。
- 分类取订阅分类，缺少时用 `defaultCategory`。阅读时长根据订阅正文/摘要估算；摘要不完整时可能偏短，可关闭。示例使用可选扩展 `readingMinutes`。
- 首次加载有骨架状态，失败可重试，空订阅显示空状态。上游临时失败时保留内存中已有缓存并提示，重启服务会清空缓存。
- 页面可见时每隔 `cacheMinutes` 分钟刷新；服务端在缓存过期后的下一次请求更新，同一订阅并发请求合并。
- 上游请求限时 10 秒、正文不超过 2 MB、最多 3 次重定向；拒绝私网/回环地址、危险协议和 XML 实体声明。链接仅允许 HTTP(S)，订阅 HTML 不作为页面 HTML 渲染。
- `direct`：浏览器直接读取 `feedUrl`，仅用于已提供 CORS 响应头的订阅或同源 RSS。

### 纯静态部署

```sh
npm run build:static
```

此命令将 RSS 内容同步为 `dist/feed.json`，并仅将 **dist 中的配置**设为 `snapshot` 模式。把 `dist/` 部署到站点根路径即可，不需要 Node 服务或第三方 RSS 代理。文章会在每次构建时更新；要定时同步，可以在自己的 CI 中定期执行该命令并重新发布。构建同步失败会明确报错，不会将失败伪装成空订阅。

纯静态模式下修改 RSS 地址或文章数量后，需要重新执行 `build:static`；其他展示配置可直接编辑已部署的 `site.config.json`。当前资源和 API 使用根路径，不支持直接部署到 `/upage/` 等子目录。

## 检查

```sh
npm run typecheck
npm test
npm run test:e2e
```

单元测试覆盖主推选择、RSS/Atom/RDF 解析、排序、去重、危险链接、缓存与地址限制。浏览器测试覆盖桌面/移动完整页面、独立链接、RSS 重试/空态、配置开关、多内容及 320–1440px 宽度。浏览器测试默认使用本机 Microsoft Edge；其他环境可在 `playwright.config.ts` 移除 `channel` 并执行 `npx playwright install chromium`。

## 设计与素材

- [设计说明、响应式与排列规则](design/README.md)
- [桌面端原稿](design/profile-desktop-demo.png) / [移动端原稿](design/profile-mobile-demo.png)
- [Figma 分层源、节点索引与验收记录](design/figma-package/README.md)
- [品牌图标来源](public/assets/ICON-SOURCES.md) / [图标许可](public/assets/ICON-LICENSE.md)
- [Noto Sans SC 字体许可](public/assets/FONT-LICENSE.txt)

Alex 是虚构人物。项目、博客文章、日期、近况与 `example.com` 链接都是可替换的示例内容，邮箱为 `hello@example.com`。工作台、项目与兴趣插画沿用项目原创 SVG；品牌图标来自 Simple Icons（CC0，商标归各权利人）。页面字体为本地打包的 Noto Sans SC。无顶部导航、天气、定位、时钟或语言切换；支持键盘焦点与减少动态效果偏好。

技术结构使用 [Vue 官方推荐的单文件组件与 Vite 工作流](https://vuejs.org/guide/quick-start.html)。
