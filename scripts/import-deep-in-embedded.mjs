import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultSourceRoot = path.resolve(projectRoot, '..', 'Deep-In-Embedded-source');
const sourceRoot = path.resolve(process.argv.find((value) => value.startsWith('--source='))?.slice(9) || defaultSourceRoot);
const sourceCommit = process.argv.find((value) => value.startsWith('--commit='))?.slice(9)
  || execFileSync('git', ['-C', sourceRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const repositoryUrl = 'https://github.com/shuai-yemao/Deep-In-Embedded';
const importedRoot = path.join(projectRoot, 'notes', 'deep-in-embedded');
const importedIndex = path.join(projectRoot, 'deep-in-embedded.js');
const categoryMap = {
  '开发板': { category: 'embedded', label: '嵌入式' },
  '操作系统': { category: 'embedded', label: '嵌入式' },
  '常用驱动': { category: 'embedded', label: '嵌入式' },
  '通信协议': { category: 'embedded', label: '嵌入式' },
  '中间件': { category: 'embedded', label: '嵌入式' },
  '嵌入式项目文档': { category: 'software', label: '软件工程' },
  '必备开发工具': { category: 'tools', label: '工具与方法' },
  '笔记系统': { category: 'tools', label: '工具与方法' },
};

function walk(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true }).filter((entry) => entry.name !== '.git');
  return entries.flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function toPosix(value) { return value.split(path.sep).join('/'); }
function repoRelative(absolute) { return toPosix(path.relative(sourceRoot, absolute)); }
function hash(value) { return crypto.createHash('sha1').update(value).digest('hex').slice(0, 8); }
function pathId(label) {
  const ascii = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return ascii ? ascii.slice(0, 36) : 'node-' + hash(label);
}
function rawUrl(relativePath) {
  return repositoryUrl + '/raw/' + sourceCommit + '/' + relativePath.split('/').map(encodeURIComponent).join('/');
}
function blobUrl(relativePath) {
  return repositoryUrl + '/blob/' + sourceCommit + '/' + relativePath.split('/').map(encodeURIComponent).join('/');
}
function stripFrontmatter(content) {
  const lines = content.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').split('\n');
  if (lines[0]?.trim() !== '---') return { content: lines.join('\n'), frontmatter: {} };
  const end = lines.findIndex((line, index) => index > 0 && line.trim() === '---');
  if (end < 0) return { content: lines.join('\n'), frontmatter: {} };
  const frontmatter = {};
  lines.slice(1, end).forEach((line) => {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (match) frontmatter[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  });
  return { content: lines.slice(end + 1).join('\n').replace(/^\n+/, ''), frontmatter };
}
function plainText(value) {
  return String(value || '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[\x60*_>#~-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
function findAsset(reference, noteRelativePath, assetByRelative, assetByBasename) {
  const cleaned = decodeURIComponent(String(reference).trim()).split('#')[0].split('?')[0].replace(/^<|>$/g, '');
  if (!cleaned || /^https?:\/\//i.test(cleaned) || /^data:image\//i.test(cleaned)) return null;
  const fromNote = toPosix(path.normalize(path.join(path.dirname(noteRelativePath), cleaned)));
  if (assetByRelative.has(fromNote)) return fromNote;
  const fromRoot = toPosix(path.normalize(cleaned.replace(/^[/\\]+/, '')));
  if (assetByRelative.has(fromRoot)) return fromRoot;
  const basename = path.posix.basename(fromRoot);
  const matches = assetByBasename.get(basename) || [];
  if (matches.length === 1) return matches[0];
  const sameDirectory = matches.find((candidate) => path.posix.dirname(candidate) === path.posix.dirname(noteRelativePath));
  return sameDirectory || matches[0] || null;
}
function findFile(reference, noteRelativePath, fileByRelative, fileByBasename) {
  const cleaned = decodeURIComponent(String(reference).trim()).split('#')[0].split('?')[0].replace(/^<|>$/g, '');
  if (!cleaned || /^https?:\/\//i.test(cleaned)) return null;
  const fromNote = toPosix(path.normalize(path.join(path.dirname(noteRelativePath), cleaned)));
  if (fileByRelative.has(fromNote)) return fromNote;
  const fromRoot = toPosix(path.normalize(cleaned.replace(/^[/\\]+/, '')));
  if (fileByRelative.has(fromRoot)) return fromRoot;
  const matches = fileByBasename.get(path.posix.basename(fromRoot)) || [];
  const sameDirectory = matches.find((candidate) => path.posix.dirname(candidate) === path.posix.dirname(noteRelativePath));
  return sameDirectory || matches[0] || null;
}
function rewriteImages(content, noteRelativePath, assetByRelative, assetByBasename, fileByRelative, fileByBasename) {
  let unresolved = 0;
  let output = content.replace(/!\[\[([^\]]+)\]\]/g, (_, inner) => {
    const parts = inner.split('|');
    const reference = parts[0].trim();
    const alt = (parts[1] || path.posix.basename(reference)).trim();
    const asset = findAsset(reference, noteRelativePath, assetByRelative, assetByBasename);
    if (!asset) {
      const attachment = findFile(reference, noteRelativePath, fileByRelative, fileByBasename);
      if (attachment) return '[附件：' + alt + '](' + blobUrl(attachment) + ')';
      unresolved += 1; return '**资源未找到：' + reference + '**';
    }
    return '![' + alt + '](' + rawUrl(asset) + ')';
  });
  output = output.replace(/!\[\]\(\s*\)/g, '');
  output = output.replace(/!\[([^\]]*)\]\(\s*(?:<([^>]+)>|(\S+?))(?:\s+["']([^"']*)["'])?\s*\)/g, (full, alt, angled, plain, title) => {
    const reference = angled || plain;
    if (/^https?:\/\//i.test(reference) || /^data:image\//i.test(reference)) return full;
    const asset = findAsset(reference, noteRelativePath, assetByRelative, assetByBasename);
    if (!asset) {
      const attachment = findFile(reference, noteRelativePath, fileByRelative, fileByBasename);
      if (attachment) return '[附件：' + (alt || path.posix.basename(reference)) + '](' + blobUrl(attachment) + ')';
      unresolved += 1; return '**资源未找到：' + reference + '**';
    }
    return '![' + (alt || path.posix.basename(reference)) + '](' + rawUrl(asset) + (title ? ' "' + title + '"' : '') + ')';
  });
  return { content: output, unresolved };
}
function extractTitleAndSummary(content, relativePath, frontmatter) {
  const lines = content.split('\n');
  const heading = lines.find((line) => /^#\s+/.test(line));
  const title = plainText(frontmatter.title || (heading ? heading.replace(/^#\s+/, '') : path.posix.basename(relativePath, '.md')));
  const start = heading ? lines.indexOf(heading) + 1 : 0;
  const summaryLine = lines.slice(start).find((line) => {
    const trimmed = line.trim();
    return trimmed && !/^#{1,6}\s/.test(trimmed) && !trimmed.startsWith(String.fromCharCode(96).repeat(3)) && !/^!\[/.test(trimmed) && !/^[-|]\s*$/.test(trimmed);
  });
  const summary = plainText(frontmatter.description || summaryLine || '来自 Deep-In-Embedded 的嵌入式学习笔记。').slice(0, 150);
  return { title: title || path.posix.basename(relativePath, '.md'), summary };
}
function insertTaxonomy(root, folders) {
  let parent = root;
  const categoryPath = [root.id];
  folders.forEach((label) => {
    const id = pathId(label);
    let child = (parent.children || []).find((item) => item.id === id);
    if (!child) {
      child = { id, label, children: [] };
      parent.children.push(child);
    }
    parent = child;
    categoryPath.push(id);
  });
  return categoryPath;
}

if (!fs.existsSync(sourceRoot)) throw new Error('Source repository not found: ' + sourceRoot);
const sourceFiles = walk(sourceRoot);
const assetExtensions = new Set(['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp']);
const assetByRelative = new Map();
const assetByBasename = new Map();
const fileByRelative = new Map();
const fileByBasename = new Map();
sourceFiles.forEach((file) => {
  const relative = repoRelative(file);
  fileByRelative.set(relative, file);
  const basename = path.posix.basename(relative);
  if (!fileByBasename.has(basename)) fileByBasename.set(basename, []);
  fileByBasename.get(basename).push(relative);
});
sourceFiles.filter((file) => assetExtensions.has(path.extname(file).toLowerCase())).forEach((file) => {
  const relative = repoRelative(file);
  assetByRelative.set(relative, file);
  const basename = path.posix.basename(relative);
  if (!assetByBasename.has(basename)) assetByBasename.set(basename, []);
  assetByBasename.get(basename).push(relative);
});

const noteFiles = sourceFiles
  .filter((file) => path.extname(file).toLowerCase() === '.md')
  .filter((file) => !['agents.md', 'readme.md'].includes(path.basename(file).toLowerCase()))
  .sort((a, b) => repoRelative(a).localeCompare(repoRelative(b), 'zh-CN'));
fs.rmSync(importedRoot, { recursive: true, force: true });
fs.mkdirSync(importedRoot, { recursive: true });

const taxonomy = {
  embedded: { id: 'embedded', label: '嵌入式', children: [] },
  software: { id: 'software', label: '软件工程', children: [] },
  tools: { id: 'tools', label: '工具与方法', children: [] },
  thinking: { id: 'thinking', label: '思考与随笔', children: [] },
};
const notes = [];
let unresolvedImages = 0;
noteFiles.forEach((file, index) => {
  const relative = repoRelative(file);
  const targetRelative = 'notes/deep-in-embedded/' + relative;
  const target = path.join(projectRoot, targetRelative.replaceAll('/', path.sep));
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const raw = fs.readFileSync(file, 'utf8');
  const parsed = stripFrontmatter(raw);
  const rewritten = rewriteImages(parsed.content, relative, assetByRelative, assetByBasename, fileByRelative, fileByBasename);
  unresolvedImages += rewritten.unresolved;
  const folders = relative.split('/').slice(0, -1);
  const sourceTopLevel = relative.split('/')[0];
  const mapping = categoryMap[sourceTopLevel];
  if (!mapping) throw new Error('No four-category mapping for source folder: ' + sourceTopLevel);
  const categoryPath = insertTaxonomy(taxonomy[mapping.category], folders);
  const meta = extractTitleAndSummary(rewritten.content, relative, parsed.frontmatter);
  const minutes = Math.max(1, Math.ceil(rewritten.content.length / 900));
  const slugBase = relative.replace(/\.md$/i, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(-48) || 'note';
  const slug = 'deep-in-embedded-' + slugBase + '-' + hash(relative);
  const attribution = '> 来源：Deep-In-Embedded / [' + relative + '](' + blobUrl(relative) + ')\n\n';
  fs.writeFileSync(target, attribution + rewritten.content, 'utf8');
  notes.push({
    slug,
    title: meta.title,
    category: mapping.category,
    categoryLabel: mapping.label,
    categoryPath,
    number: String(index + 100),
    date: '2026.09.04',
    readTime: minutes + ' min',
    summary: meta.summary,
    file: targetRelative,
    source: { repository: repositoryUrl, commit: sourceCommit, path: relative },
  });
});

const indexSource = [
  '/* Generated from shuai-yemao/Deep-In-Embedded at commit ' + sourceCommit + '. */',
  'window.POWER_IMPORTED_NOTES = ' + JSON.stringify(notes, null, 2) + ';',
  'window.POWER_IMPORTED_TAXONOMY = ' + JSON.stringify(taxonomy, null, 2) + ';',
  'window.POWER_NOTES.push(...window.POWER_IMPORTED_NOTES);',
  'if (Array.isArray(window.POWER_TAXONOMY)) { Object.values(window.POWER_IMPORTED_TAXONOMY).forEach((importedRoot) => { const root = window.POWER_TAXONOMY.find((item) => item.id === importedRoot.id); if (root) root.children = [...(root.children || []), ...(importedRoot.children || [])]; }); }',
  '',
].join('\n');
fs.writeFileSync(importedIndex, indexSource, 'utf8');
console.log(JSON.stringify({
  sourceRoot,
  sourceCommit,
  markdownCount: notes.length,
  imageCount: assetByRelative.size,
  unresolvedImages,
  importedRoot,
  importedIndex,
}, null, 2));
