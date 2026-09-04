const noteBody = document.querySelector('#markdownBody');
const noteToc = document.querySelector('#noteToc');
const noteSideTitle = document.querySelector('#noteSideTitle');
const noteCrumb = document.querySelector('#noteCrumb');
const slug = new URLSearchParams(location.search).get('slug') || window.POWER_NOTES[0].slug;
const currentNote = window.POWER_NOTES.find((note) => note.slug === slug) || window.POWER_NOTES[0];

function escapeHtml(value) { return value.replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
function inlineMarkdown(value) { return escapeHtml(value).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>'); }
function renderMarkdown(markdown) {
  const lines = markdown.replaceAll('\r\n','\n').split('\n');
  const output = [];
  const headings = [];
  let inCode = false; let codeLines = []; let listItems = [];
  const flushList = () => { if (listItems.length) { output.push(`<ul>${listItems.join('')}</ul>`); listItems = []; } };
  const flushCode = () => { if (inCode) { output.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`); codeLines = []; inCode = false; } };
  lines.forEach((line) => {
    if (line.startsWith('```')) { flushList(); if (inCode) flushCode(); else inCode = true; return; }
    if (inCode) { codeLines.push(line); return; }
    if (/^#{1,3} /.test(line)) { flushList(); const level = line.match(/^#+/)[0].length; const text = line.replace(/^#+ /,''); const id = `section-${headings.length}`; headings.push({ id, text, level }); output.push(`<h${level} id="${id}">${inlineMarkdown(text)}</h${level}>`); return; }
    if (line.startsWith('> ')) { flushList(); output.push(`<blockquote>${inlineMarkdown(line.slice(2))}</blockquote>`); return; }
    if (/^- /.test(line)) { listItems.push(`<li>${inlineMarkdown(line.slice(2))}</li>`); return; }
    if (!line.trim()) { flushList(); return; }
    flushList(); output.push(`<p>${inlineMarkdown(line)}</p>`);
  });
  flushList(); flushCode();
  noteToc.innerHTML = headings.filter((item) => item.level === 2).map((item) => `<a href="#${item.id}">${item.text}</a>`).join('');
  return output.join('');
}

noteSideTitle.textContent = currentNote.title;
noteCrumb.textContent = currentNote.title;
document.title = `${currentNote.title}｜Power Notes`;
fetch(currentNote.file).then((response) => { if (!response.ok) throw new Error('Markdown file not found'); return response.text(); }).then((markdown) => { noteBody.innerHTML = `<div class="note-header"><p class="eyebrow">${currentNote.categoryLabel.toUpperCase()} / NOTE ${currentNote.number}</p><div class="note-date-line">${currentNote.date} · ${currentNote.readTime.toUpperCase()}</div><h1>${currentNote.title}</h1><p class="note-lead">${currentNote.summary}</p></div>${renderMarkdown(markdown)}<div class="article-end"><span>本文由 Markdown 源文件驱动</span><a href="library.html?category=${currentNote.category}">继续浏览 ${currentNote.categoryLabel} →</a></div>`; }).catch((error) => { noteBody.innerHTML = `<div class="empty-state">笔记暂时无法加载：${error.message}</div>`; });
