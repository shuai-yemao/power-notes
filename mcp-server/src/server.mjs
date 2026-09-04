import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const categoryRoots = ['embedded', 'software', 'tools', 'thinking'];
const categoryRootSchema = z.enum(categoryRoots);

const assetSchema = z.object({
  path: z.string().min(1).max(240),
  mimeType: z.string().min(1).max(120),
  contentBase64: z.string().max(8 * 1024 * 1024),
});

const notePackageSchema = z.object({
  schemaVersion: z.literal('1.0'),
  document: z.object({
    title: z.string().trim().min(1).max(240),
    summary: z.string().trim().max(500).optional(),
    markdown: z.string().min(1),
    format: z.literal('markdown'),
  }),
  target: z.object({
    category: categoryRootSchema,
    path: z.array(z.string().trim().min(1).max(100)).min(1).max(8),
  }),
  assets: z.array(assetSchema).max(30).default([]),
  provenance: z.object({
    provider: z.string().trim().max(80).optional(),
    sourceId: z.string().trim().max(240).optional(),
    revision: z.string().trim().max(240).optional(),
    sourcePath: z.string().trim().max(500).optional(),
  }).optional(),
});

const configSchema = z.object({
  targetRepository: z.string().min(1),
  importDirectory: z.string().default('notes/agent-imports'),
  generatedIndex: z.string().default('agent-notes.js'),
  maxMarkdownBytes: z.number().int().positive().default(1024 * 1024),
  maxAssetBytes: z.number().int().positive().default(5 * 1024 * 1024),
  maxAssetsPerNote: z.number().int().positive().max(100).default(30),
});

function result(value, isError = false) {
  return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }], isError };
}

function errorResult(message, details = {}) {
  return result({ status: 'error', error: message, ...details }, true);
}

function slugify(value) {
  const ascii = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (ascii) return ascii.slice(0, 72);
  return `note-${crypto.createHash('sha256').update(value).digest('hex').slice(0, 12)}`;
}

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function isInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === '' || (relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

function safeRelativePath(relativePath, label) {
  if (!relativePath || path.isAbsolute(relativePath) || /^[A-Za-z]:[\\/]/.test(relativePath)) {
    throw new Error(`${label} must be a relative path`);
  }
  const normalized = path.normalize(relativePath);
  if (normalized === '..' || normalized.startsWith(`..${path.sep}`)) {
    throw new Error(`${label} cannot escape the target repository`);
  }
  return normalized;
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

async function loadConfig() {
  const configFile = process.env.POWER_NOTES_CONFIG || path.join(serverRoot, 'config', 'sources.json');
  try {
    return configSchema.parse(await readJson(configFile));
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Missing MCP config. Copy ${path.join(serverRoot, 'config', 'sources.example.json')} to sources.json or set POWER_NOTES_CONFIG.`);
    }
    throw new Error(`Invalid MCP config: ${error.message}`);
  }
}

async function loadTarget() {
  const config = await loadConfig();
  const targetRoot = path.resolve(config.targetRepository);
  const importDirectory = safeRelativePath(config.importDirectory, 'importDirectory');
  const generatedIndex = safeRelativePath(config.generatedIndex, 'generatedIndex');
  const importRoot = path.resolve(targetRoot, importDirectory);
  const generatedIndexFile = path.resolve(targetRoot, generatedIndex);
  if (!isInside(targetRoot, importRoot) || !isInside(targetRoot, generatedIndexFile)) {
    throw new Error('Configured target paths must remain inside targetRepository');
  }
  return { config, targetRoot, importRoot, generatedIndexFile };
}

async function evaluateWindowFiles(targetRoot, files) {
  const window = {};
  const context = vm.createContext({ window });
  for (const file of files) {
    const filePath = path.join(targetRoot, file);
    try {
      const source = await fs.readFile(filePath, 'utf8');
      vm.runInContext(source, context, { filename: filePath, timeout: 1000 });
    } catch (error) {
      if (error.code === 'ENOENT') continue;
      throw new Error(`Cannot read generated index ${file}: ${error.message}`);
    }
  }
  return window;
}

async function loadTaxonomy(targetRoot) {
  const window = await evaluateWindowFiles(targetRoot, ['taxonomy.js']);
  if (!Array.isArray(window.POWER_TAXONOMY)) throw new Error('taxonomy.js did not expose POWER_TAXONOMY');
  return window.POWER_TAXONOMY;
}

async function loadNotes(targetRoot, generatedIndexFile) {
  const files = ['notes.js', 'deep-in-embedded.js', toPosix(path.relative(targetRoot, generatedIndexFile))];
  const window = { POWER_NOTES: [] };
  const context = vm.createContext({ window });
  for (const file of files) {
    const filePath = path.join(targetRoot, file);
    try {
      const source = await fs.readFile(filePath, 'utf8');
      vm.runInContext(source, context, { filename: filePath, timeout: 1500 });
    } catch (error) {
      if (error.code === 'ENOENT') continue;
      throw new Error(`Cannot read note index ${file}: ${error.message}`);
    }
  }
  return Array.isArray(window.POWER_NOTES) ? window.POWER_NOTES : [];
}

function findTaxonomyNode(nodes, ids) {
  let current = nodes;
  let node = null;
  for (const id of ids) {
    node = current.find((item) => item.id === id);
    if (!node) return null;
    current = node.children || [];
  }
  return node;
}

function plainText(value) {
  return String(value || '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[\x60*_>#~-]/g, '').replace(/\s+/g, ' ').trim();
}

function deriveSummary(note) {
  if (note.document.summary) return note.document.summary;
  const headingIndex = note.document.markdown.split(/\r?\n/).findIndex((line) => /^#\s+/.test(line));
  const lines = note.document.markdown.split(/\r?\n/).slice(Math.max(0, headingIndex + 1));
  const paragraph = lines.find((line) => line.trim() && !/^#{1,6}\s/.test(line.trim()) && !line.trim().startsWith('```'));
  return plainText(paragraph || '由 Agent 导入的个人学习笔记。').slice(0, 150);
}

function validatePackage(note, taxonomy, config) {
  if (note.target.path[0] !== note.target.category) throw new Error('target.path must start with target.category');
  if (!findTaxonomyNode(taxonomy, note.target.path.map((value, index) => index === 0 ? value : slugify(value)))) {
    throw new Error(`target.path does not exist in the Power Notes taxonomy: ${note.target.path.join(' / ')}`);
  }
  if (Buffer.byteLength(note.document.markdown, 'utf8') > config.maxMarkdownBytes) throw new Error('Markdown payload exceeds the configured size limit');
  if (note.assets.length > config.maxAssetsPerNote) throw new Error('Too many assets in one note');
  for (const asset of note.assets) {
    safeRelativePath(asset.path, 'asset.path');
    if (!/^[-\w./ ]+\.(png|jpe?g|gif|svg|webp|bmp|json|txt|pdf)$/i.test(asset.path)) throw new Error(`Unsupported asset path: ${asset.path}`);
    const bytes = Buffer.from(asset.contentBase64, 'base64');
    if (bytes.length > config.maxAssetBytes) throw new Error(`Asset exceeds the configured size limit: ${asset.path}`);
  }
}

function buildMetadata(note, slug, relativeFile) {
  const provenance = note.provenance
    ? Object.fromEntries(Object.entries(note.provenance).filter(([key]) => key !== 'sourcePath'))
    : { provider: 'agent' };
  return {
    slug,
    title: note.document.title,
    category: note.target.category,
    categoryLabel: ({ embedded: '嵌入式', software: '软件工程', tools: '工具与方法', thinking: '思考与随笔' })[note.target.category],
    categoryPath: note.target.path.map((value, index) => index === 0 ? value : slugify(value)),
    number: 'A' + crypto.createHash('sha1').update(slug).digest('hex').slice(0, 6),
    date: new Date().toISOString().slice(0, 10).replaceAll('-', '.'),
    readTime: `${Math.max(1, Math.ceil(note.document.markdown.length / 900))} min`,
    summary: deriveSummary(note),
    file: toPosix(relativeFile),
    source: provenance,
  };
}

function rewriteAssetReferences(markdown, assets, slug) {
  let output = markdown;
  for (const asset of assets) {
    const targetReference = `assets/${slug}/${toPosix(asset.path)}`;
    output = output.split(asset.path).join(targetReference);
  }
  return output;
}

async function buildPreview(note) {
  const target = await loadTarget();
  const taxonomy = await loadTaxonomy(target.targetRoot);
  const notes = await loadNotes(target.targetRoot, target.generatedIndexFile);
  validatePackage(note, taxonomy, target.config);
  const slug = slugify(note.document.title);
  const existing = notes.find((item) => item.slug === slug);
  const relativeFile = path.join(target.config.importDirectory, `${slug}.md`);
  return {
    status: existing ? 'conflict' : 'ready',
    slug,
    title: note.document.title,
    summary: deriveSummary(note),
    category: note.target.category,
    path: note.target.path.join(' / '),
    file: toPosix(relativeFile),
    assetCount: note.assets.length,
    existing: existing ? { title: existing.title, file: existing.file } : null,
    requiresApproval: true,
  };
}

async function readGeneratedNotes(file) {
  try {
    const source = await fs.readFile(file, 'utf8');
    const window = { POWER_NOTES: [] };
    vm.runInNewContext(source, vm.createContext({ window }), { filename: file, timeout: 1000 });
    return Array.isArray(window.POWER_AGENT_NOTES) ? window.POWER_AGENT_NOTES : [];
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function writeGeneratedNotes(file, notes) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const source = [
    '/* Generated by power-notes-mcp. Do not edit manually. */',
    'window.POWER_AGENT_NOTES = ' + JSON.stringify(notes, null, 2) + ';',
    'window.POWER_NOTES.push(...window.POWER_AGENT_NOTES);',
    '',
  ].join('\n');
  await fs.writeFile(file, source, 'utf8');
}

async function importNote(note, approved) {
  if (!approved) return errorResult('Import requires explicit approved=true after preview_note().');
  const target = await loadTarget();
  const taxonomy = await loadTaxonomy(target.targetRoot);
  const notes = await loadNotes(target.targetRoot, target.generatedIndexFile);
  validatePackage(note, taxonomy, target.config);
  const slug = slugify(note.document.title);
  if (notes.some((item) => item.slug === slug)) return errorResult('A note with this slug already exists.', { slug, status: 'conflict' });
  const relativeFile = path.join(target.config.importDirectory, `${slug}.md`);
  const noteFile = path.resolve(target.targetRoot, relativeFile);
  if (!isInside(target.targetRoot, noteFile)) return errorResult('Generated note path escaped target repository.');
  const content = rewriteAssetReferences(note.document.markdown, note.assets, slug).replace(/^\uFEFF/, '').trimEnd() + '\n';
  await fs.mkdir(path.dirname(noteFile), { recursive: true });
  await fs.writeFile(noteFile, content, 'utf8');
  for (const asset of note.assets) {
    const assetRelative = path.join(target.config.importDirectory, 'assets', slug, asset.path);
    const assetFile = path.resolve(target.targetRoot, assetRelative);
    if (!isInside(target.targetRoot, assetFile)) return errorResult('Generated asset path escaped target repository.');
    await fs.mkdir(path.dirname(assetFile), { recursive: true });
    await fs.writeFile(assetFile, Buffer.from(asset.contentBase64, 'base64'));
  }
  const generatedNotes = await readGeneratedNotes(target.generatedIndexFile);
  const metadata = buildMetadata(note, slug, relativeFile);
  await writeGeneratedNotes(target.generatedIndexFile, [...generatedNotes, metadata]);
  return result({ status: 'imported', slug, file: toPosix(relativeFile), generatedIndex: toPosix(path.relative(target.targetRoot, target.generatedIndexFile)), next: 'Run the static build, inspect git diff, then commit and push when ready.' });
}

function createServer() {
  const server = new McpServer({ name: 'power-notes', version: '0.1.0' });
  server.registerTool('get_taxonomy', {
    title: 'Get Power Notes taxonomy',
    description: 'Read the destination Power Notes taxonomy. This tool does not inspect any source editor or source repository.',
    inputSchema: z.object({}),
    annotations: { readOnlyHint: true, openWorldHint: false },
  }, async () => {
    try {
      const target = await loadTarget();
      return result({ status: 'ok', taxonomy: await loadTaxonomy(target.targetRoot) });
    } catch (error) {
      return errorResult(error.message);
    }
  });
  server.registerTool('preview_note', {
    title: 'Preview normalized note',
    description: 'Validate a source-independent NotePackage and return the destination path and conflicts without writing files.',
    inputSchema: z.object({ note: notePackageSchema }),
    annotations: { readOnlyHint: true, openWorldHint: false },
  }, async ({ note }) => {
    try {
      return result(await buildPreview(note));
    } catch (error) {
      return errorResult(error.message);
    }
  });
  server.registerTool('import_note', {
    title: 'Import approved note',
    description: 'Write an approved, normalized NotePackage into the configured Power Notes workspace. It never reads source MCPs and never commits or pushes Git changes.',
    inputSchema: z.object({ note: notePackageSchema, approved: z.boolean().default(false) }),
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  }, async ({ note, approved }) => {
    try {
      return await importNote(note, approved);
    } catch (error) {
      return errorResult(error.message);
    }
  });
  return server;
}

serveStdio(() => createServer(), { onerror: (error) => console.error('[power-notes-mcp]', error.message) });
