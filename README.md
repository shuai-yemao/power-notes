# Power Notes

个人学习知识库博客，使用原生 HTML、CSS 和 JavaScript 构建，Markdown 文件作为笔记内容源。`index.html` 是独立首页，`library.html` 是知识库目录与检索页面。

发布前会通过 `scripts/build-static.mjs` 生成 `dist` 静态产物目录。

## 本地预览

```powershell
python -m http.server 4173
```

然后打开 <http://127.0.0.1:4173/index.html> 查看首页，或打开 <http://127.0.0.1:4173/library.html> 进入知识库目录。

## CI/CD

`.github/workflows/deploy.yml` 会在推送到 `main` 或手动触发时：

1. 检查全部 JavaScript 文件语法；
2. 构建并检查 `dist` 静态产物和 Sites 配置文件；
3. 通过 GitHub Pages 发布 `dist`。

Pull Request 只执行校验，不会直接发布生产站点。

## Markdown 内容能力

笔记文件支持以下 fenced code block：

````markdown
```mermaid
flowchart LR
  A[输入] --> B[处理] --> C[输出]
```

```echarts
{"xAxis":{"type":"category","data":["A","B"]},"yAxis":{},"series":[{"type":"bar","data":[12,20]}]}
```

```c
int main(void) { return 0; }
```

```json
{
  "name": "Power Notes",
  "enabled": true
}
```

行内公式支持 `$E = mc^2$` 或 `\(E = mc^2\)`；独占一行的块级公式支持：

```markdown
$$
\int_0^1 x^2\,dx = \frac{1}{3}
$$
```
````

独占一行的图片使用标准 Markdown 图片语法：

```markdown
![图片说明](../assets/example.svg "可选图注")
```

Mermaid、ECharts 和 KaTeX 只在当前笔记确实包含对应内容时按需加载；外部渲染库加载失败时会保留 Mermaid、ECharts 或 LaTeX 源码，避免笔记内容消失。JSON 代码块支持 `json` 和 `jsonc` 语言标记。

## 导入 Deep-In-Embedded 笔记

使用导入器可以把 `Deep-In-Embedded` 的 Markdown 笔记按原仓库层级加入现有四大知识库：开发板、操作系统、常用驱动、通信协议和中间件归入“嵌入式”；嵌入式项目文档归入“软件工程”；必备开发工具和笔记系统归入“工具与方法”。“思考与随笔”不强行放入不匹配的技术笔记。

```powershell
node scripts/import-deep-in-embedded.mjs --source=..\Deep-In-Embedded-source
node scripts/build-static.mjs
```

导入器会记录源仓库提交号，并在每篇笔记顶部保留来源链接。图片文件不会复制到当前站点仓库；本次导入将图片引用重写为源仓库固定提交的 GitHub Raw 地址，因此 Git 只保存 Markdown 和索引文件，避免大量二进制文件阻塞上传。后续源仓库更新时重新执行导入器即可刷新内容和固定提交地址。

这种方式依赖源仓库保持公开且可访问。如果未来需要完全独立于源仓库长期保存图片，再将图片迁移到 Git LFS、对象存储或独立资源仓库，并把导入器的图片地址策略切换到该资源域名。
