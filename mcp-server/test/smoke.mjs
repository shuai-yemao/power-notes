import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'power-notes-mcp-'));
await fs.cp(repoRoot, tempRoot, { recursive: true, filter: (source) => !source.includes(`${path.sep}.git${path.sep}`) && !source.includes(`${path.sep}node_modules${path.sep}`) });
const configFile = path.join(tempRoot, 'mcp-server', 'config', 'sources.json');
await fs.writeFile(configFile, JSON.stringify({ targetRepository: tempRoot }), 'utf8');

const transport = new StdioClientTransport({
  command: process.execPath,
  args: [path.join(repoRoot, 'mcp-server', 'src', 'server.mjs')],
  cwd: tempRoot,
  env: { ...process.env, POWER_NOTES_CONFIG: configFile },
});
const client = new Client({ name: 'power-notes-mcp-smoke', version: '0.1.0' });
await client.connect(transport);
const listed = await client.listTools();
assert.deepEqual(listed.tools.map((tool) => tool.name), ['get_taxonomy', 'preview_note', 'import_note']);

const note = {
  schemaVersion: '1.0',
  document: { title: 'MCP 导入烟雾测试', markdown: '# MCP 导入烟雾测试\n\n验证本地 MCP。', format: 'markdown' },
  target: { category: 'tools', path: ['tools', 'knowledge', 'markdown', 'file-metadata'] },
  assets: [],
  provenance: { provider: 'smoke-test', sourceId: 'smoke-001' },
};
const preview = await client.callTool({ name: 'preview_note', arguments: { note } });
const previewBody = JSON.parse(preview.content[0].text);
assert.equal(previewBody.status, 'ready');
const rejected = await client.callTool({ name: 'import_note', arguments: { note } });
assert.equal(rejected.isError, true);
assert.equal(JSON.parse(rejected.content[0].text).status, 'error');
const imported = await client.callTool({ name: 'import_note', arguments: { note, approved: true } });
const importedBody = JSON.parse(imported.content[0].text);
assert.equal(importedBody.status, 'imported');
assert.equal((await fs.stat(path.join(tempRoot, importedBody.file))).isFile(), true);
assert.equal((await fs.stat(path.join(tempRoot, importedBody.generatedIndex))).isFile(), true);
await client.close();
await fs.rm(tempRoot, { recursive: true, force: true });
console.log('power-notes-mcp smoke test passed');
