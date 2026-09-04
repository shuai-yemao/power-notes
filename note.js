const noteBody = document.querySelector('#markdownBody');
const noteToc = document.querySelector('#noteToc');
const noteLibraryList = document.querySelector('#noteLibraryList');
const noteLibraryCount = document.querySelector('#noteLibraryCount');
const noteCrumb = document.querySelector('#noteCrumb');
const slug = new URLSearchParams(location.search).get('slug') || window.POWER_NOTES[0].slug;
const currentNote = window.POWER_NOTES.find((note) => note.slug === slug) || window.POWER_NOTES[0];

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
  let source = String(value ?? '').replace(/!\[([^\]]*)\]\(\s*(\S+?)(?:\s+["']([^"']*)["'])?\s*\)/g, (_, alt, url, title) => token(renderImage(alt, url, title)));
  source = source.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => token(renderLink(label, url)));
  source = source.replace(/`([^`]+)`/g, (_, code) => token(`<code>${escapeHtml(code)}</code>`));
  source = source.replace(/\\\(([\s\S]+?)\\\)|(?<!\$)\$(?!\$)([^$\n]+?)(?<!\$)\$(?!\$)/g, (_, paren, dollar) => token(renderMathPlaceholder(paren ?? dollar, mathExpressions)));
  return escapeHtml(source)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
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
  const currentDirectory = Array.isArray(currentNote.categoryPath) ? currentNote.categoryPath.join('/') : currentNote.category;
  const sameLibraryNotes = window.POWER_NOTES.filter((note) => (Array.isArray(note.categoryPath) ? note.categoryPath.join('/') : note.category) === currentDirectory);
  noteLibraryCount.textContent = `${sameLibraryNotes.length} 篇`;
  noteLibraryList.innerHTML = sameLibraryNotes.map((note) => {
    const labels = noteCategoryLabels(note);
    const active = note.slug === currentNote.slug;
    return `<a class="note-library-link${active ? ' active' : ''}" href="note.html?slug=${encodeURIComponent(note.slug)}"${active ? ' aria-current="page"' : ''}><span>${escapeHtml(labels.slice(-2).join(' / '))} / NOTE ${escapeHtml(note.number)}</span><strong>${escapeHtml(note.title)}</strong></a>`;
  }).join('');
}
function renderMarkdown(markdown) {
  const lines = markdown.replaceAll('\r\n','\n').split('\n');
  const output = [];
  const headings = [];
  const diagrams = [];
  const charts = [];
  const math = [];
  activeMathExpressions = math;
  let inCode = false; let codeLines = []; let listItems = [];
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
    codeLines = []; codeLanguage = 'text'; inCode = false;
  };
  lines.forEach((line) => {
    if (line.startsWith('```')) { flushList(); if (inCode) flushCode(); else { inCode = true; codeLanguage = line.slice(3).trim().toLowerCase() || 'text'; } return; }
    if (inCode) { codeLines.push(line); return; }
    const trimmed = line.trim();
    if (inMath) { if (trimmed === mathDelimiter) flushMath(); else mathLines.push(line); return; }
    if (trimmed === '$$' || trimmed === '\\[') { flushList(); inMath = true; mathDelimiter = trimmed === '$$' ? '$$' : '\\]'; mathLines = []; return; }
    const singleMath = trimmed.match(/^\$\$([\s\S]+)\$\$$/) || trimmed.match(/^\\\[([\s\S]+)\\\]$/);
    if (singleMath) { flushList(); output.push(renderMathPlaceholder(singleMath[1], math, true)); return; }
    const imageMatch = line.match(/^\s*!\[([^\]]*)\]\(\s*(\S+?)(?:\s+["']([^"']*)["'])?\s*\)\s*$/);
    if (imageMatch) { flushList(); output.push(renderImage(imageMatch[1], imageMatch[2], imageMatch[3], true)); return; }
    if (/^#{1,3} /.test(line)) { flushList(); const level = line.match(/^#+/)[0].length; const text = line.replace(/^#+ /,''); const id = `section-${headings.length}`; headings.push({ id, text, level }); output.push(`<h${level} id="${id}">${inlineMarkdown(text)}</h${level}>`); return; }
    if (line.startsWith('> ')) { flushList(); output.push(`<blockquote>${inlineMarkdown(line.slice(2))}</blockquote>`); return; }
    if (/^- /.test(line)) { listItems.push(`<li>${inlineMarkdown(line.slice(2))}</li>`); return; }
    if (!line.trim()) { flushList(); return; }
    flushList(); output.push(`<p>${inlineMarkdown(line)}</p>`);
  });
  flushList(); flushCode(); flushMath();
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
noteCrumb.textContent = currentNote.title;
document.title = `${currentNote.title}｜Power Notes`;
fetch(currentNote.file).then((response) => { if (!response.ok) throw new Error('Markdown file not found'); return response.text(); }).then((markdown) => { const renderResult = renderMarkdown(markdown); noteBody.innerHTML = `<div class="note-header"><p class="eyebrow">${currentNote.categoryLabel.toUpperCase()} / NOTE ${currentNote.number}</p><div class="note-date-line">${currentNote.date} · ${currentNote.readTime.toUpperCase()}</div><div class="note-category-path" id="noteCategoryPath" aria-label="笔记分类路径">${renderCategoryPath(currentNote)}</div><h1>${escapeHtml(currentNote.title)}</h1><p class="note-lead">${escapeHtml(currentNote.summary)}</p></div>${renderResult.html}<div class="article-end"><span>本文由 Markdown 源文件驱动</span><a href="library.html?category=${encodeURIComponent(currentNote.category)}&path=${encodeURIComponent(currentNote.category)}">继续浏览 ${escapeHtml(currentNote.categoryLabel)} →</a></div>`; enhanceMarkdown(renderResult); }).catch((error) => { noteBody.innerHTML = `<div class="empty-state">笔记暂时无法加载：${error.message}</div>`; });
