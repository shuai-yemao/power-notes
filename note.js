const noteBody = document.querySelector('#markdownBody');
const noteToc = document.querySelector('#noteToc');
const noteLibraryList = document.querySelector('#noteLibraryList');
const noteLibraryCount = document.querySelector('#noteLibraryCount');
const noteLibraryBack = document.querySelector('#noteLibraryBack');
const noteCrumb = document.querySelector('#noteCrumb');
const slug = new URLSearchParams(location.search).get('slug') || window.POWER_NOTES[0].slug;
const currentNote = window.POWER_NOTES.find((note) => note.slug === slug) || window.POWER_NOTES[0];
const returnTarget = (() => {
  const value = new URLSearchParams(location.search).get('from');
  if (!value) return null;
  try {
    const target = new URL(value, location.href);
    if (!target.pathname.endsWith('/library.html')) return null;
    return `${target.pathname.split('/').pop()}${target.search}${target.hash}`;
  } catch (_) {
    return null;
  }
})();

function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
function escapeAttribute(value) { return escapeHtml(value); }
function resolveMediaUrl(value, isImage = false) {
  try {
    const rawUrl = String(value).trim();
    const baseUrl = new URL(currentNote.file, document.baseURI);
    const resolved = new URL(rawUrl, baseUrl);
    const validProtocol = resolved.protocol === 'http:' || resolved.protocol === 'https:';
    const validDataImage = isImage && resolved.protocol === 'data:' && resolved.href.startsWith('data:image/');
    if (validProtocol || validDataImage) return resolved.href;
  } catch (_) {
    // Invalid media URLs are rendered as an accessible error instead of being executed.
  }
  return null;
}
function renderImage(alt, url, title = '', block = false) {
  const source = resolveMediaUrl(url, true);
  if (!source) return `<span class="markdown-media-error">图片地址无效：${escapeHtml(url)}</span>`;
  const image = `<img src="${escapeAttribute(source)}" alt="${escapeAttribute(alt)}" loading="lazy" decoding="async">`;
  if (!block) return `<span class="markdown-image-inline">${image}</span>`;
  return `<figure class="markdown-image">${image}${title ? `<figcaption>${escapeHtml(title)}</figcaption>` : ''}</figure>`;
}
function renderLink(label, url) {
  try {
    const target = new URL(String(url).trim(), document.baseURI);
    const validProtocol = ['http:', 'https:', 'mailto:'].includes(target.protocol);
    return validProtocol ? `<a href="${escapeAttribute(target.href)}">${escapeHtml(label)}</a>` : escapeHtml(label);
  } catch (_) {
    return escapeHtml(label);
  }
}
function renderWikiLink(reference, label) {
  const rawReference = String(reference ?? '').trim();
  const target = rawReference.split('#')[0].replace(/\.md$/i, '').replaceAll('\\', '/');
  const targetName = target.split('/').filter(Boolean).pop() || target;
  const display = String(label || targetName || rawReference).trim();
  const normalizedTarget = target.toLowerCase();
  const match = window.POWER_NOTES.find((note) => {
    const file = String(note.file || '').replaceAll('\\', '/').replace(/\.md$/i, '').toLowerCase();
    const title = String(note.title || '').toLowerCase();
    return title === normalizedTarget || title === targetName.toLowerCase() || file === normalizedTarget || file.endsWith('/' + normalizedTarget);
  });
  if (!match) return `<span class="markdown-wiki-unresolved" title="Obsidian 链接目标未导入">${escapeHtml(display)}</span>`;
  return `<a class="markdown-wiki-link" href="${escapeAttribute(noteHref(match))}">${escapeHtml(display)}</a>`;
}
function renderWikiImage(inner) {
  const parts = String(inner).split('|');
  const reference = parts.shift().trim();
  const alt = (parts.join('|').trim() || pathBasename(reference));
  return renderImage(alt, reference);
}
function pathBasename(value) { return String(value || '').replaceAll('\\', '/').split('/').pop() || 'Obsidian 图片'; }
function cleanNoteSummary(value) { return String(value ?? '').replace(/^\s*>?\s*\[![A-Za-z0-9_-]+\]\s*/i, '').trim(); }
function noteDirectoryKey(note) { return Array.isArray(note.categoryPath) ? note.categoryPath.join('/') : note.category; }
function sameDirectoryNotes() { const directory = noteDirectoryKey(currentNote); return window.POWER_NOTES.filter((note) => noteDirectoryKey(note) === directory); }
function fallbackDirectoryHref() { return `library.html?category=${encodeURIComponent(currentNote.category)}&path=${encodeURIComponent(currentNote.category)}`; }
function returnDirectoryHref() { return returnTarget || fallbackDirectoryHref(); }
function noteHref(note) { const params = new URLSearchParams({ slug: note.slug }); if (returnTarget) params.set('from', returnTarget); return `note.html?${params.toString()}`; }
function renderArticleEnd() {
  const notes = sameDirectoryNotes();
  const currentIndex = notes.findIndex((note) => note.slug === currentNote.slug);
  const previous = currentIndex > 0 ? notes[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < notes.length - 1 ? notes[currentIndex + 1] : null;
  const renderSibling = (note, label, direction) => note ? `<a class="article-sibling article-sibling-${direction}" href="${escapeAttribute(noteHref(note))}"><span>${label}</span><strong>${escapeHtml(note.title)}</strong></a>` : `<span class="article-sibling article-sibling-${direction} is-disabled"><span>${label}</span><strong>没有更多笔记</strong></span>`;
  return `<div class="article-end"><div class="article-sibling-row">${renderSibling(previous, '上一篇', 'previous')}${renderSibling(next, '下一篇', 'next')}</div></div>`;
}
function renderMathPlaceholder(expression, mathExpressions, display = false) {
  const source = String(expression ?? '').trim();
  const id = `math-${display ? 'display' : 'inline'}-${mathExpressions.length}`;
  mathExpressions.push({ id, source, display });
  if (!display) return `<span class="math-inline" id="${id}" role="math" aria-label="LaTeX 公式">${escapeHtml(source)}</span>`;
  return `<div class="math-display" id="${id}" role="math" aria-label="LaTeX 公式"><div class="math-loading">正在加载 LaTeX 公式…</div></div>`;
}
let activeMathExpressions = [];
function inlineMarkdown(value, mathExpressions = activeMathExpressions) {
  const tokens = [];
  const token = (html) => { const id = `@@POWER_TOKEN_${tokens.length}@@`; tokens.push(html); return id; };
  let source = String(value ?? '').replace(/%%[\s\S]*?%%/g, '');
  source = source.replace(/`([^`]+)`/g, (_, code) => token(`<code>${escapeHtml(code)}</code>`));
  source = source.replace(/!\[\[([^\]]+)\]\]/g, (_, inner) => token(renderWikiImage(inner)));
  source = source.replace(/!\[([^\]]*)\]\(\s*(\S+?)(?:\s+["']([^"']*)["'])?\s*\)/g, (_, alt, url, title) => token(renderImage(alt, url, title)));
  source = source.replace(/\[\[([^\]]+)\]\]/g, (_, inner) => { const parts = inner.split('|'); return token(renderWikiLink(parts[0], parts[1])); });
  source = source.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => token(renderLink(label, url)));
  source = source.replace(/\\\(([\s\S]+?)\\\)|(?<!\$)\$(?!\$)([^$\n]+?)(?<!\$)\$(?!\$)/g, (_, paren, dollar) => token(renderMathPlaceholder(paren ?? dollar, mathExpressions)));
  return escapeHtml(source)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')
    .replace(/~~([^~]+)~~/g, '<del>$1</del>')
    .replace(/==([^=\n]+)==/g, '<mark>$1</mark>')
    .replace(/(^|[\s(])#([\p{L}\p{N}_\-/]+)/gu, '$1<span class="markdown-tag">#$2</span>')
    .replace(/(?<![\w*])\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>')
    .replace(/@@POWER_TOKEN_(\d+)@@/g, (_, index) => tokens[Number(index)]);
}
const C_KEYWORDS = new Set('alignas alignof asm auto break case catch class const constexpr continue default delete do else enum explicit export extern for friend goto if inline mutable namespace new noexcept operator private protected public register reinterpret_cast requires return sizeof static static_assert static_cast struct switch template this thread_local throw try typedef typeid typename union using virtual volatile while'.split(' '));
const C_TYPES = new Set('bool char double float int long short signed size_t stdint uint8_t uint16_t uint32_t uint64_t void wchar_t'.split(' '));
function highlightCCode(source) {
  const pattern = /(\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b)/g;
  let output = ''; let lastIndex = 0; let match;
  while ((match = pattern.exec(source))) {
    output += escapeHtml(source.slice(lastIndex, match.index));
    const value = match[0];
    let className = 'code-token';
    if (value.startsWith('//') || value.startsWith('/*')) className += ' code-comment';
    else if (value.startsWith('"') || value.startsWith("'")) className += ' code-string';
    else if (/^\d/.test(value)) className += ' code-number';
    else if (C_KEYWORDS.has(value)) className += ' code-keyword';
    else if (C_TYPES.has(value)) className += ' code-type';
    output += `<span class="${className}">${escapeHtml(value)}</span>`;
    lastIndex = match.index + value.length;
  }
  return output + escapeHtml(source.slice(lastIndex));
}
function highlightJson(source) {
  const pattern = /(\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:\\.|[^"\\])*"|-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?|\b(?:true|false|null)\b)/g;
  let output = ''; let lastIndex = 0; let match;
  while ((match = pattern.exec(source))) {
    output += escapeHtml(source.slice(lastIndex, match.index));
    const value = match[0];
    let className = 'code-token';
    if (value.startsWith('//') || value.startsWith('/*')) className += ' code-comment';
    else if (value.startsWith('"')) className += /^\s*:/.test(source.slice(match.index + value.length)) ? ' code-property' : ' code-string';
    else if (/^-?\d|^\.\d/.test(value)) className += ' code-number';
    else className += ' code-literal';
    output += `<span class="${className}">${escapeHtml(value)}</span>`;
    lastIndex = match.index + value.length;
  }
  return output + escapeHtml(source.slice(lastIndex));
}
function codeLanguageLabel(language) {
  const labels = { c: 'C', h: 'C Header', cpp: 'C++', 'c++': 'C++', cc: 'C++', cxx: 'C++', hpp: 'C++ Header', json: 'JSON', jsonc: 'JSONC', mermaid: 'Mermaid', echarts: 'ECharts', echart: 'ECharts', chart: 'ECharts' };
  return labels[language] || (language === 'text' ? 'TEXT' : language.toUpperCase());
}
function renderCode(source, language) {
  const normalized = (language || 'text').toLowerCase();
  const code = ['c', 'h', 'cpp', 'c++', 'cc', 'cxx', 'hpp'].includes(normalized) ? highlightCCode(source) : ['json', 'jsonc'].includes(normalized) ? highlightJson(source) : escapeHtml(source);
  return `<div class="code-block"><div class="code-meta"><span>${escapeHtml(codeLanguageLabel(normalized))}</span><span>CODE</span></div><pre><code class="language-${escapeAttribute(normalized)}">${code}</code></pre></div>`;
}
function noteCategoryLabels(note) { return Array.isArray(note.categoryPath) ? window.getTaxonomyLabels(note.categoryPath) : [note.categoryLabel]; }
function renderCategoryPath(note) { const labels = noteCategoryLabels(note); return labels.map((label, index) => { const path = note.categoryPath?.slice(0, index + 1).join('/') || note.category; return `<a href="library.html?category=${encodeURIComponent(note.category)}&path=${encodeURIComponent(path)}">${escapeHtml(label)}</a>`; }).join('<span aria-hidden="true"> / </span>'); }
function renderLibraryNav() {
  const sameLibraryNotes = sameDirectoryNotes();
  noteLibraryCount.textContent = `${sameLibraryNotes.length} 篇`;
  noteLibraryList.innerHTML = sameLibraryNotes.map((note) => {
    const active = note.slug === currentNote.slug;
    return `<a class="note-library-link${active ? ' active' : ''}" href="${escapeAttribute(noteHref(note))}"${active ? ' aria-current="page"' : ''}><strong>${escapeHtml(note.title)}</strong><small class="note-library-summary">${escapeHtml(cleanNoteSummary(note.summary))}</small></a>`;
  }).join('');
}
const CALLOUT_LABELS = { note: 'NOTE', info: 'INFO', tip: 'TIP', hint: 'HINT', success: 'SUCCESS', question: 'QUESTION', warning: 'WARNING', caution: 'CAUTION', failure: 'FAILURE', danger: 'DANGER', bug: 'BUG', example: 'EXAMPLE', quote: 'QUOTE' };
function stripObsidianComments(markdown) {
  const sourceLines = String(markdown).replaceAll('\r\n', '\n').split('\n');
  const result = []; let inCode = false; let codeFence = ''; let inComment = false;
  sourceLines.forEach((line) => {
    const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/);
    if (fenceMatch) {
      if (!inCode) { inCode = true; codeFence = fenceMatch[1][0]; }
      else if (fenceMatch[1][0] === codeFence) { inCode = false; codeFence = ''; }
      result.push(line); return;
    }
    if (inCode) { result.push(line); return; }
    let rest = line; let output = '';
    while (rest.length) {
      if (inComment) {
        const end = rest.indexOf('%%');
        if (end < 0) { rest = ''; break; }
        rest = rest.slice(end + 2); inComment = false; continue;
      }
      const start = rest.indexOf('%%');
      if (start < 0) { output += rest; rest = ''; break; }
      output += rest.slice(0, start); rest = rest.slice(start + 2); inComment = true;
    }
    result.push(output);
  });
  return result;
}
function tableCells(line) { return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim()); }
function isTableSeparator(line) { return /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line); }
function renderTable(rows) {
  if (!rows.length) return '';
  const header = rows[0].map((cell) => `<th scope="col">${inlineMarkdown(cell)}</th>`).join('');
  const body = rows.slice(1).map((row) => `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join('')}</tr>`).join('');
  return `<div class="markdown-table-wrap"><table class="markdown-table"><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table></div>`;
}
function renderCallout(callout) {
  const type = String(callout.type || 'note').toLowerCase();
  const label = CALLOUT_LABELS[type] || type.toUpperCase();
  const title = callout.title.trim() || label;
  const body = []; let list = [];
  const flush = () => { if (list.length) { body.push(`<ul>${list.join('')}</ul>`); list = []; } };
  callout.lines.forEach((line) => {
    if (!line.trim()) { flush(); return; }
    if (/^- /.test(line)) { list.push(`<li>${inlineMarkdown(line.slice(2))}</li>`); return; }
    flush(); body.push(`<p>${inlineMarkdown(line)}</p>`);
  });
  flush();
  return `<aside class="markdown-callout callout-${escapeAttribute(type)}"><div class="callout-title"><span>${escapeHtml(label)}</span><strong>${inlineMarkdown(title)}</strong></div><div class="callout-body">${body.join('')}</div></aside>`;
}
function renderMarkdown(markdown) {
  const lines = stripObsidianComments(markdown);
  const output = [];
  const headings = [];
  const diagrams = [];
  const charts = [];
  const math = [];
  activeMathExpressions = math;
  let inCode = false; let codeFence = ''; let codeLines = []; let listItems = []; let activeCallout = null;
  let codeLanguage = 'text';
  let inMath = false; let mathLines = []; let mathDelimiter = '';
  const flushList = () => { if (listItems.length) { output.push(`<ul>${listItems.join('')}</ul>`); listItems = []; } };
  const flushMath = () => { if (!inMath) return; output.push(renderMathPlaceholder(mathLines.join('\n'), math, true)); mathLines = []; mathDelimiter = ''; inMath = false; };
  const flushCode = () => {
    if (!inCode) return;
    const source = codeLines.join('\n');
    const normalized = (codeLanguage || 'text').toLowerCase();
    if (normalized === 'mermaid') {
      const id = `mermaid-${diagrams.length}`;
      diagrams.push({ id, source });
      output.push(`<div class="markdown-diagram" id="${id}" role="img" aria-label="Mermaid 图表"><div class="diagram-loading">正在加载 Mermaid 图表…</div></div>`);
    } else if (['echarts', 'echart', 'chart'].includes(normalized)) {
      const id = `echarts-${charts.length}`;
      charts.push({ id, source });
      output.push(`<figure class="markdown-chart"><div class="chart-loading" id="${id}" role="img" aria-label="ECharts 图表">正在加载 ECharts 图表…</div><figcaption>交互式 ECharts 图表</figcaption></figure>`);
    } else {
      output.push(renderCode(source, normalized));
    }
    codeLines = []; codeLanguage = 'text'; codeFence = ''; inCode = false;
  };
  const flushCallout = () => { if (activeCallout) { flushList(); output.push(renderCallout(activeCallout)); activeCallout = null; } };
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    const fenceMatch = line.match(/^\s*(`{3,}|~{3,})(.*)$/);
    if (fenceMatch) {
      if (!inCode) { flushCallout(); flushList(); inCode = true; codeFence = fenceMatch[1][0]; codeLanguage = fenceMatch[2].trim().toLowerCase() || 'text'; continue; }
      if (fenceMatch[1][0] === codeFence) { flushCode(); continue; }
    }
    if (inCode) { codeLines.push(line); continue; }
    const trimmed = line.trim();
    if (inMath) { if (trimmed === mathDelimiter) flushMath(); else mathLines.push(line); continue; }
    if (activeCallout) {
      const continuation = line.match(/^>\s?(.*)$/);
      if (continuation) { activeCallout.lines.push(continuation[1]); continue; }
      flushCallout();
    }
    const calloutStart = line.match(/^>\s*\[!([A-Za-z0-9_-]+)\](?:\s*(.*))?$/i);
    if (calloutStart) { flushList(); activeCallout = { type: calloutStart[1], title: calloutStart[2] || '', lines: [] }; continue; }
    if (trimmed === '$$' || trimmed === '\\[') { flushList(); inMath = true; mathDelimiter = trimmed === '$$' ? '$$' : '\\]'; mathLines = []; continue; }
    const singleMath = trimmed.match(/^\$\$([\s\S]+)\$\$$/) || trimmed.match(/^\\\[([\s\S]+)\\\]$/);
    if (singleMath) { flushList(); output.push(renderMathPlaceholder(singleMath[1], math, true)); continue; }
    if (line.includes('|') && lineIndex + 1 < lines.length && isTableSeparator(lines[lineIndex + 1])) {
      flushList(); const rows = [tableCells(line)]; lineIndex += 2;
      while (lineIndex < lines.length && lines[lineIndex].includes('|') && lines[lineIndex].trim()) { rows.push(tableCells(lines[lineIndex])); lineIndex += 1; }
      lineIndex -= 1; output.push(renderTable(rows)); continue;
    }
    const imageMatch = line.match(/^\s*!\[([^\]]*)\]\(\s*(\S+?)(?:\s+["']([^"']*)["'])?\s*\)\s*$/);
    if (imageMatch) { flushList(); output.push(renderImage(imageMatch[1], imageMatch[2], imageMatch[3], true)); continue; }
    if (/^#{1,6} /.test(line)) { flushList(); const level = line.match(/^#+/)[0].length; const text = line.replace(/^#+\s+/,''); const id = `section-${headings.length}`; headings.push({ id, text, level }); output.push(`<h${level} id="${id}">${inlineMarkdown(text)}</h${level}>`); continue; }
    if (/^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line)) { flushList(); output.push('<hr class="markdown-rule">'); continue; }
    if (line.startsWith('> ')) { flushList(); output.push(`<blockquote>${inlineMarkdown(line.slice(2))}</blockquote>`); continue; }
    if (/^- /.test(line)) {
      const task = line.match(/^- \[([ xX])\]\s+(.*)$/);
      if (task) listItems.push(`<li class="task-item"><input type="checkbox" disabled${task[1].toLowerCase() === 'x' ? ' checked' : ''} aria-label="${task[1].toLowerCase() === 'x' ? '已完成' : '未完成'}"><span>${inlineMarkdown(task[2])}</span></li>`);
      else listItems.push(`<li>${inlineMarkdown(line.slice(2))}</li>`);
      continue;
    }
    if (!line.trim()) { flushList(); continue; }
    flushList(); output.push(`<p>${inlineMarkdown(line)}</p>`);
  }
  flushCallout(); flushList(); flushCode(); flushMath();
  activeMathExpressions = [];
  noteToc.innerHTML = headings.filter((item) => item.level > 1).map((item) => `<a class="note-outline-link level-${item.level}" href="#${item.id}">${escapeHtml(item.text)}</a>`).join('');
  return { html: output.join(''), diagrams, charts, math };
}

function showRenderError(node, label, source) {
  node.classList.add('is-fallback');
  node.innerHTML = `<div class="markdown-media-error">${label}暂时无法渲染，已保留源代码：</div><pre><code>${escapeHtml(source)}</code></pre>`;
}
async function renderMermaidDiagrams(diagrams) {
  if (!diagrams.length) return;
  try {
    const module = await import('https://cdn.jsdelivr.net/npm/mermaid@11.9.0/dist/mermaid.esm.min.mjs');
    const mermaid = module.default || module;
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: document.body.classList.contains('dark') ? 'dark' : 'default' });
    const nodes = diagrams.map(({ id, source }) => { const node = document.getElementById(id); node.textContent = source; return node; });
    await mermaid.run({ nodes });
  } catch (error) {
    diagrams.forEach(({ id, source }) => { const node = document.getElementById(id); if (node) showRenderError(node, 'Mermaid 图表', source); });
  }
}
function loadScript(source, globalName) {
  if (window[globalName]) return Promise.resolve(window[globalName]);
  const existing = document.querySelector(`script[data-power-loader="${globalName}"]`);
  if (existing) return new Promise((resolve, reject) => { existing.addEventListener('load', () => resolve(window[globalName])); existing.addEventListener('error', reject); });
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = source; script.async = true; script.fetchPriority = 'low'; script.dataset.powerLoader = globalName;
    script.onload = () => resolve(window[globalName]); script.onerror = reject; document.head.appendChild(script);
  });
}
function loadStylesheet(source, key) {
  const existing = document.querySelector('link[data-power-style="' + key + '"]');
  if (existing) return Promise.resolve(existing);
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = source; link.dataset.powerStyle = key;
    link.onload = () => resolve(link); link.onerror = reject; document.head.appendChild(link);
  });
}
function showMathError(node, source, display) {
  node.classList.add('is-fallback');
  node.textContent = source;
  node.title = 'LaTeX 公式暂时无法渲染';
  if (display) node.setAttribute('aria-label', 'LaTeX 公式源码：' + source);
}
async function renderLatex(mathExpressions) {
  if (!mathExpressions.length) return;
  try {
    const module = await import('https://cdn.jsdelivr.net/npm/katex@0.18.5/dist/katex.mjs');
    const katex = module.default || module;
    loadStylesheet('https://cdn.jsdelivr.net/npm/katex@0.18.5/dist/katex.min.css', 'katex').catch(() => {});
    mathExpressions.forEach(({ id, source, display }) => {
      const node = document.getElementById(id);
      if (!node) return;
      try {
        katex.render(source, node, { displayMode: display, throwOnError: false, trust: false, output: 'htmlAndMathml' });
        node.setAttribute('aria-label', 'LaTeX 公式：' + source);
      } catch (_) {
        showMathError(node, source, display);
      }
    });
  } catch (_) {
    mathExpressions.forEach(({ id, source, display }) => { const node = document.getElementById(id); if (node) showMathError(node, source, display); });
  }
}
function applyChartTheme(chart, option) {
  const dark = document.body.classList.contains('dark');
  if (!dark) return;
  const axisTheme = { axisLabel: { color: '#c7d4c9' }, axisLine: { lineStyle: { color: '#607267' } }, splitLine: { lineStyle: { color: '#324037' } } };
  const themeOption = {
    textStyle: { color: '#e7eee8' },
    title: { textStyle: { color: '#e7eee8' }, subtextStyle: { color: '#91a095' } },
    legend: { textStyle: { color: '#e7eee8' } },
  };
  if (option.xAxis) themeOption.xAxis = Array.isArray(option.xAxis) ? option.xAxis.map(() => axisTheme) : axisTheme;
  if (option.yAxis) themeOption.yAxis = Array.isArray(option.yAxis) ? option.yAxis.map(() => axisTheme) : axisTheme;
  chart.setOption(themeOption);
}
async function renderEcharts(charts) {
  if (!charts.length) return;
  try {
    const echarts = await loadScript('https://cdn.jsdelivr.net/npm/echarts@5.6.0/dist/echarts.min.js', 'echarts');
    if (!echarts) throw new Error('ECharts library unavailable');
    const chartRecords = [];
    charts.forEach(({ id, source }) => {
      const node = document.getElementById(id);
      try {
        const option = JSON.parse(source);
        node.innerHTML = '';
        node.setAttribute('aria-label', option.ariaLabel || option.title?.text || 'ECharts 图表');
        const chart = echarts.init(node, null, { renderer: 'svg' });
        chart.setOption(option);
        applyChartTheme(chart, option);
        chartRecords.push({ chart, option });
        const resize = () => chart.resize();
        window.addEventListener('resize', resize, { passive: true });
        node.closest('.markdown-chart')._powerChartCleanup = () => { window.removeEventListener('resize', resize); chart.dispose(); };
      } catch (_) {
        showRenderError(node, 'ECharts 图表', source);
      }
    });
    const themeObserver = new MutationObserver(() => chartRecords.forEach(({ chart, option }) => applyChartTheme(chart, option)));
    themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  } catch (_) {
    charts.forEach(({ id, source }) => { const node = document.getElementById(id); if (node) showRenderError(node, 'ECharts 图表', source); });
  }
}
function enhanceMarkdown(renderResult) {
  renderMermaidDiagrams(renderResult.diagrams);
  renderEcharts(renderResult.charts);
  renderLatex(renderResult.math);
}

renderLibraryNav();
if (noteLibraryBack) noteLibraryBack.href = returnDirectoryHref();
noteCrumb.textContent = currentNote.title;
document.title = `${currentNote.title}｜Power Notes`;
fetch(currentNote.file).then((response) => { if (!response.ok) throw new Error('Markdown file not found'); return response.text(); }).then((markdown) => { const renderResult = renderMarkdown(markdown); noteBody.innerHTML = `<div class="note-header"><p class="eyebrow">${currentNote.categoryLabel.toUpperCase()} / NOTE ${currentNote.number}</p><div class="note-date-line">${currentNote.date} · ${currentNote.readTime.toUpperCase()}</div><div class="note-category-path" id="noteCategoryPath" aria-label="笔记分类路径">${renderCategoryPath(currentNote)}</div><h1>${escapeHtml(currentNote.title)}</h1><p class="note-lead">${escapeHtml(cleanNoteSummary(currentNote.summary))}</p></div>${renderResult.html}${renderArticleEnd()}`; enhanceMarkdown(renderResult); }).catch((error) => { noteBody.innerHTML = `<div class="empty-state">笔记暂时无法加载：${error.message}</div>`; });
