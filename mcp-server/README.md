# Power Notes MCP

本地 MCP 目标端服务。它只接收标准化 `NotePackage`，不读取 Obsidian 或 uTools，也不管理其他 MCP。

## 运行前配置

复制 `config/sources.example.json` 为 `config/sources.json`，只填写 Power Notes 目标仓库：

```json
{
  "targetRepository": "D:\\Projects\\power-notes",
  "importDirectory": "notes/agent-imports",
  "generatedIndex": "agent-notes.js"
}
```

`config/sources.json` 是本机私有配置，不应提交到 Git。也可以通过 `POWER_NOTES_CONFIG` 环境变量指定配置文件。

## 安装与启动

```powershell
npm install
npm start
```

MCP 客户端应以 `stdio` 子进程启动：

```json
{
  "mcpServers": {
    "power-notes": {
      "command": "node",
      "args": ["D:\\Tools\\power-notes\\mcp-server\\src\\server.mjs"],
      "env": {
        "POWER_NOTES_CONFIG": "D:\\Tools\\power-notes\\mcp-server\\config\\sources.json"
      }
    }
  }
}
```

## 工具

- `get_taxonomy`：读取 Power Notes 目标目录。
- `preview_note`：校验标准化笔记，不写文件。
- `import_note`：只有 `approved: true` 才写入目标仓库；不会提交或推送 Git。

导入工具的目标输入是 `NotePackage`，不包含源仓库路径：

```json
{
  "schemaVersion": "1.0",
  "document": {
    "title": "FreeRTOS 队列设计",
    "summary": "记录队列容量和所有权边界。",
    "markdown": "# FreeRTOS 队列设计\n\n正文……",
    "format": "markdown"
  },
  "target": {
    "category": "embedded",
    "path": ["embedded", "realtime", "freertos", "queue-design"]
  },
  "assets": [],
  "provenance": {
    "provider": "opaque",
    "sourceId": "source-note-123"
  }
}
```

源 MCP 负责把 Obsidian/uTools 内容转换成这个契约，Power Notes MCP 只负责目标知识库校验和写入。

## 安全边界

- 只监听 `stdio`，不开放 HTTP 端口。
- 只读取配置中的目标仓库文件。
- 所有生成路径都必须位于目标仓库内。
- 禁止绝对路径和 `..` 路径。
- 默认不覆盖同 slug 笔记。
- 默认只写入工作区，不自动 commit、push 或创建 Pull Request。
- 生成索引为 `agent-notes.js`，与人工维护的 `notes.js` 分开。

## 测试

```powershell
npm run smoke
```
