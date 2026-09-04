# Power Notes

个人学习知识库博客，使用原生 HTML、CSS 和 JavaScript 构建，Markdown 文件作为笔记内容源。

## 本地预览

```powershell
python -m http.server 4173
```

然后打开 <http://127.0.0.1:4173/index.html>。

## CI/CD

`.github/workflows/deploy.yml` 会在推送到 `main` 或手动触发时：

1. 检查全部 JavaScript 文件语法；
2. 检查静态站点入口和 Sites 配置文件；
3. 通过 GitHub Pages 发布站点。

Pull Request 只执行校验，不会直接发布生产站点。
