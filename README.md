# Power Notes

个人学习知识库博客，使用原生 HTML、CSS 和 JavaScript 构建，Markdown 文件作为笔记内容源。

发布前会通过 `scripts/build-static.mjs` 生成 `dist` 静态产物目录。

## 本地预览

```powershell
python -m http.server 4173
```

然后打开 <http://127.0.0.1:4173/index.html>。

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
````

独占一行的图片使用标准 Markdown 图片语法：

```markdown
![图片说明](../assets/example.svg "可选图注")
```

Mermaid 和 ECharts 只在当前笔记确实包含对应代码块时按需加载；外部图表库加载失败时会保留源代码，避免笔记内容消失。
