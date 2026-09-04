# 层级知识库目录实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans）逐任务实现此计划。步骤使用 `- [ ]` 语法跟踪进度。

**目标：** 为 Power Notes 增加二级、三级、四级知识库分类树，并让首页、目录页和 Markdown 阅读页共享同一套分类数据。

**架构：** `taxonomy.js` 保存分类树，`notes.js` 保存笔记分类路径。目录页按 URL 节点路径筛选该节点及后代笔记；阅读页根据当前笔记路径生成分类面包屑。

**技术栈：** 原生 HTML、CSS、JavaScript；静态文件；URLSearchParams；现有 Markdown fetch 渲染逻辑。

---

## 文件清单

- 创建 `taxonomy.js`：分类树数据和节点查询函数。
- 修改 `notes.js`：为笔记增加稳定的 `categoryPath`。
- 修改 `library.html`、`directory.js`：增加分类树、展开状态、节点筛选和 URL 恢复。
- 修改 `note.html`、`note.js`：加载分类树并显示完整分类路径。
- 修改 `index.html`：将主题入口指向具体子分类。
- 修改 `styles.css`：完成树形缩进、计数、焦点态和响应式布局。
- 不修改 `notes/*.md` 和 `app.js`。

## 任务 1：共享分类树与笔记元数据

**文件：** 创建 `taxonomy.js`；修改 `notes.js`。

- [ ] **步骤 1：创建分类树**

定义 `window.POWER_TAXONOMY`，顶层固定为 `embedded`、`software`、`tools`、`thinking`，写入规格确认的完整二级、三级、四级节点。每个节点包含 `id`、`label`、可选 `children`。

提供 `findTaxonomyNode(path)`、`isTaxonomyDescendant(path, ancestorPath)`、`getTaxonomyLabels(path)` 三个纯函数。查询函数按 `/` 分隔路径逐级遍历 `children`；后代函数要求祖先路径逐项匹配；标签函数返回路径对应的中文名称。

- [ ] **步骤 2：绑定四篇笔记**

在 `notes.js` 保留现有 `category`、`categoryLabel`，增加 `categoryPath` 数组：FreeRTOS → `embedded/realtime/freertos/task-design`；Platform/Impl → `embedded/architecture/platform-impl/boundary`；Markdown → `tools/knowledge/markdown/file-metadata`；代码审查 → `software/quality/review/method`。`categoryPath[0]` 必须与 `category` 相同。

- [ ] **步骤 3：检查并提交**

~~~powershell
node --check taxonomy.js
node --check notes.js
git add taxonomy.js notes.js
git commit -m 'Add hierarchical knowledge taxonomy'
~~~

预期：命令退出码均为 `0`；四条笔记路径都能解析到分类树节点。

## 任务 2：目录树、筛选和 URL 状态

**文件：** 修改 `library.html`、`directory.js`。

- [ ] **步骤 1：增加容器**

在现有目录列表左侧增加 `<aside class='taxonomy-panel' aria-label='知识库层级目录'><div id='taxonomyTree'></div></aside>`，右侧保留 `directoryList` 和空状态；一级分类按钮继续保留为快捷入口。

- [ ] **步骤 2：实现路径筛选**

读取 `category` 和 `path` 查询参数。`noteMatchesDirectory(note)` 对 `all` 匹配全部，否则用 `isTaxonomyDescendant(note.categoryPath, directoryPath)` 判断；缺少路径的笔记只按一级分类回退。递归 `countNodeNotes(path)` 从 `POWER_NOTES` 计算节点及后代数量。

- [ ] **步骤 3：实现可展开树**

递归渲染 `.taxonomy-item`、`.taxonomy-expander` 和 `.taxonomy-select`。展开按钮只修改 `hidden` 与 `aria-expanded`，选择按钮更新当前节点。当前节点及祖先自动展开，空节点保留并显示 `0`。

- [ ] **步骤 4：同步 URL 和历史记录**

选择节点使用 `history.pushState` 更新 `library.html?category=<root>&path=<path>`；监听 `popstate` 恢复筛选。旧的 `library.html?category=embedded` 等一级链接继续有效。

- [ ] **步骤 5：检查并提交**

验证软件工程 → 代码质量 → Review 方法筛选、空分类状态、展开不改 URL、浏览器后退恢复路径。

~~~powershell
git add library.html directory.js
git commit -m 'Render hierarchical directory navigation'
~~~

## 任务 3：首页和阅读页联动

**文件：** 修改 `index.html`、`note.html`、`note.js`。

- [ ] **步骤 1：更新首页入口**

将基础概念、工程实践、工具链、复盘随笔分别指向规格确认的二级或三级节点；四个知识库卡片继续使用一级 `?category=<root>` 入口。

- [ ] **步骤 2：加载分类数据并渲染面包屑**

将 `note.html` 脚本顺序设为 `notes.js`、`taxonomy.js`、`note.js`、`app.js`，增加 `#noteCategoryPath`。在 `note.js` 中按 `categoryPath` 的每个前缀生成链接，链接格式为 `library.html?category=<root>&path=<prefix>`；路径缺失时回退到一级分类。

- [ ] **步骤 3：检查并提交**

验证首页子分类入口、阅读页完整分类路径、面包屑上级节点返回对应筛选目录。

~~~powershell
git add index.html note.html note.js
git commit -m 'Link notes to taxonomy paths'
~~~

## 任务 4：树形视觉和响应式布局

**文件：** 修改 `styles.css`。

- [ ] **步骤 1：桌面布局**

目录页使用分类树约 `250px`、笔记列表占剩余宽度的两列布局；使用 `padding-inline-start` 表达层级，不新增渐变和大圆角。

- [ ] **步骤 2：状态与主题**

为活动节点、展开按钮焦点、hover 和零数量节点提供清晰样式；深色模式沿用现有高对比度变量。

- [ ] **步骤 3：响应式**

`850px` 以下将分类树置于列表上方；`600px` 以下允许长分类名换行，确保 320px 宽度无横向滚动。

- [ ] **步骤 4：检查并提交**

在 1280px、375px 视口检查目录页和阅读页的浅色、深色模式。

~~~powershell
git add styles.css
git commit -m 'Style responsive taxonomy tree'
~~~

## 任务 5：最终验证

**文件：** 验证 `taxonomy.js`、`notes.js`、`directory.js`、`note.js`、`index.html`、`library.html`、`note.html`、`styles.css`。

- [ ] **步骤 1：运行静态检查**

~~~powershell
node --check taxonomy.js
node --check notes.js
node --check directory.js
node --check note.js
git diff --check
~~~

- [ ] **步骤 2：执行分类覆盖检查**

确认四个一级节点存在且各有二级节点，嵌入式存在四级路径，四篇笔记路径均可解析，空叶子节点显示 `0 篇`。

- [ ] **步骤 3：执行用户流程**

验证一级卡片 → 二级分类 → 三级分类 → 四级叶子 → 笔记正文 → 分类面包屑返回；验证搜索匹配标题、分类路径和 Markdown 正文；验证主题切换不丢失 URL。

- [ ] **步骤 4：记录状态**

~~~powershell
git status --short --branch
git log -5 --oneline
~~~

确认工作区干净；线上 Sites 发布仍单独受服务端可用性影响，不将本地浏览器验证描述为线上部署完成。
