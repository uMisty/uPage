# uPage · Figma 交付源包

本目录是最新设计稿的分层导入源，全部人物、项目、文章、联系方式与链接均为公共示例。2026-09-18 的项目列表修订已同步到原 Figma 文件的 6 张相关画板。最新验收见 `project-list-sync-validation.json`：尺寸、字体、纵向排列及 48 个独立项目链接通过，6 个项目区域截图已复核。以下全文件图层统计、素材导出验收和像素核对记录对应修订前版本。

[打开 Figma 完整设计](https://www.figma.com/design/W1YzNgkM2X2TH9enCZeS8X?node-id=3-2)

Figma 页面分为「完整页面」「多内容排列」「模块设计」「独立切图」。11 张画板与 19 份独立素材的尺寸、文字数量全部与源文件对应；合计保留 704 个原生文字图层和 1,317 个矢量图层，没有栅格图片填充，也没有缺失字体。48 个项目按钮均保留独立 URL 原型交互。

## 内容

- 11 张设计画板：桌面与移动完整页面、多内容排列、首屏、项目模块、创作工具，以及桌面内容与生活模块。
- `sections/`：36 份分区 SVG，按自我介绍、项目、文章与近况、创作工具、兴趣和联系分区，便于组织 Figma 图层。
- `assets/`：19 份独立素材，每份同时提供 SVG 和 `@2x.png`。包含工作台插画、5 个项目封面、5 个兴趣插画、6 个工具标志及深浅两种跳转箭头。
- `manifest.json`：画板尺寸、分区位置、矢量源、字体栈与配色。
- `source-comparison.json`：分区合成稿与原稿的像素核对结果。没有超过 1/255 色阶的通道偏差。
- `source-layer-audit.json`：SVG 文字、矢量、链接和栅格图片元素数量审计。

## 图层与导出

SVG 源保留独立文字、形状、路径、分组与项目链接。Figma 内正文与插画文字均为原生文字图层，形状和路径为可编辑矢量。画板采用纵向自动布局容器；各分区内部保留源稿构图和图形分组。

所有独立素材均实际执行过 SVG 与 PNG 2× 导出：PNG 尺寸正确，SVG 保留文字且不包含栅格图片。验证结果见 `figma-source-validation.json` 和 `figma-export-validation.json`，节点地址映射见 `figma-state.json`。

在 Figma 的「独立切图」页面选择对应素材根图层，即可在 Export 中导出 SVG 或 PNG 2×。素材名称标签与预览底色属于画布辅助内容，不参与素材导出。

素材的透明区域保留，项目封面与兴趣插画使用设计中原有背景。白色跳转箭头适用于深色或蓝色背景。

Demo 与 GitHub 入口分别保留，当前链接指向保留域名 example.com，发布项目前需要替换为真实地址。

## 再生成

在已安装 `sharp` 的 Node.js 环境中运行 `node design/prepare-figma.cjs`。源稿使用 Segoe UI、Microsoft YaHei、Noto Sans CJK SC 字体栈；Figma 云端未提供前两种字体，因此统一适配为 Noto Sans SC，并恢复原始字重与字距。该字体替换已在桌面、移动端与独立素材上进行视觉核验。

## 素材许可

工作台、项目、兴趣插画和箭头均来自本项目的原创矢量设计。React、Vue、TypeScript、Node.js、Figma、Git 标志来自 Simple Icons，采用 CC0；参见随包的 `ICON-LICENSE.md` 和 `ICON-SOURCES.md`。商标权归相应权利人所有。
