# 知径 · Wayfinder

<img src="assets/wayfinder-logo.svg" alt="知径 Wayfinder" width="360">

> 让互联网更像图书馆。

知径（Wayfinder）是一个人工策展的信息导航网页。它不做无限信息流，也不依赖推荐算法，而是把值得长期阅读的信息源按主题、场景和用途整理成一个可搜索、可筛选的静态页面。

## 功能

- 编辑书架：按阅读场景浏览一组经过筛选的来源
- 分类导航：长文、科学、世界与制度、数据核验、技术、中文深读等
- 搜索与筛选：按站点、主题、地区、语言和访问方式查找
- 收藏：使用浏览器 `localStorage` 保存本地收藏
- 随机浏览：从当前可用来源中随机打开一个站点
- 来源说明：展示推荐理由、访问方式、深度、地区，以及需要注意的编辑/机构背景
- 深色模式

## 技术

这是一个纯静态项目：

- HTML
- CSS
- Vanilla JavaScript
- JSON 数据

不需要构建步骤、后端服务或数据库，可以直接部署到 GitHub Pages 或其他静态托管服务。

## 项目结构

```text
.
├─ index.html
├─ styles.css
├─ app.js
├─ LICENSE
├─ assets/
│  ├─ wayfinder-mark.svg
│  └─ wayfinder-logo.svg
└─ data/
   ├─ sites/
   │  ├─ 01.json
   │  ├─ 02.json
   │  ├─ ...
   │  └─ 08.json
   ├─ sections.json
   └─ collections.json
```

站点目录拆成 8 个 JSON 分片，由前端并行读取并合并；目前共收录 123 个来源。

## 本地预览

由于页面通过 `fetch()` 读取 JSON 数据，建议使用任意静态 HTTP server 预览，而不是直接双击 `index.html`。

例如：

```bash
python -m http.server 8080
```

## 数据说明

站点说明属于人工策展与编辑备注，不是对任何机构的认证，也不应替代原始材料核验。网站状态、付费方式、编辑定位和机构背景都可能变化；重要信息请以来源网站的最新公开信息为准。

外部网站的名称、商标和内容归各自权利人所有。本项目仅提供导航与编辑性描述。

## License

本项目采用 [MIT License](LICENSE)。
