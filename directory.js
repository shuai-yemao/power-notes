const directoryList = document.querySelector('#directoryList');
const directoryCount = document.querySelector('#directoryCount');
const directoryEmpty = document.querySelector('#directoryEmpty');
const directorySearch = document.querySelector('#librarySearch');
const directoryTabs = [...document.querySelectorAll('#directoryTabs .category')];
const taxonomyTree = document.querySelector('#taxonomyTree');
const taxonomyCount = document.querySelector('#taxonomyCount');
const directoryParams = new URLSearchParams(location.search);
let directoryFilter = directoryParams.get('category') || 'all';
let directoryPath = directoryParams.get('path') || directoryFilter;
const directoryMarkdownIndex = new Map();
const expandedPaths = new Set();

function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
function escapeAttribute(value) { return escapeHtml(value); }
function pathIds(path) { return Array.isArray(path) ? path : String(path || '').split('/').filter(Boolean); }
function pathKey(path) { return pathIds(path).join('/'); }
function isPathPrefix(ancestor, path) { const a = pathIds(ancestor); const b = pathIds(path); return a.length <= b.length && a.every((id, index) => id === b[index]); }
function selectedRoot() { return directoryPath === 'all' ? 'all' : pathIds(directoryPath)[0]; }
function currentDirectoryHref() { const page = location.pathname.split('/').pop() || 'library.html'; return `${page}${location.search}${location.hash}`; }
function noteHref(note) { return `note.html?slug=${encodeURIComponent(note.slug)}&from=${encodeURIComponent(currentDirectoryHref())}`; }

function normalizeDirectoryState() {
  if (directoryPath === 'all') { directoryFilter = 'all'; return; }
  const requestedNode = window.findTaxonomyNode(directoryPath);
  if (!requestedNode) directoryPath = directoryFilter === 'all' ? 'all' : directoryFilter;
  directoryFilter = directoryPath === 'all' ? 'all' : pathIds(directoryPath)[0];
}

function noteMatchesDirectory(note) {
  if (directoryPath === 'all') return true;
  if (Array.isArray(note.categoryPath)) return window.isTaxonomyDescendant(note.categoryPath, directoryPath);
  return note.category === directoryFilter;
}

function countNodeNotes(path) { return window.POWER_NOTES.filter((note) => Array.isArray(note.categoryPath) && window.isTaxonomyDescendant(note.categoryPath, path)).length; }

function renderTaxonomyNode(node, parentPath, level) {
  const currentPath = [...pathIds(parentPath), node.id];
  const key = pathKey(currentPath);
  const children = node.children || [];
  const hasChildren = children.length > 0;
  const expanded = hasChildren && (expandedPaths.has(key) || directoryPath === 'all' || isPathPrefix(key, directoryPath));
  const active = directoryPath === key;
  const count = countNodeNotes(currentPath);
  const levelLabel = ['','一级','二级','三级','四级'][level] || `${level}级`;
  const childMarkup = hasChildren ? `<div class="taxonomy-children"${expanded ? '' : ' hidden'}>${children.map((child) => renderTaxonomyNode(child, currentPath, level + 1)).join('')}</div>` : '';
  return `<div class="taxonomy-item${active ? ' active' : ''}" data-path="${escapeHtml(key)}"><div class="taxonomy-row" data-level="${level}">${hasChildren ? `<button class="taxonomy-expander" type="button" aria-expanded="${expanded}" aria-label="${expanded ? '折叠' : '展开'}${escapeHtml(node.label)}">${expanded ? '−' : '+'}</button>` : '<span class="taxonomy-expander-spacer" aria-hidden="true"></span>'}<button class="taxonomy-select${active ? ' active' : ''}" type="button" data-path="${escapeHtml(key)}"><span class="taxonomy-label"><small class="taxonomy-level-badge">${levelLabel}</small>${escapeHtml(node.label)}</span><b>${count}</b></button></div>${childMarkup}</div>`;
}

function renderTaxonomy() {
  normalizeDirectoryState();
  if (!taxonomyTree) return;
  taxonomyTree.innerHTML = window.POWER_TAXONOMY.map((node) => renderTaxonomyNode(node, [], 1)).join('');
  taxonomyCount.textContent = `${window.POWER_NOTES.length} 篇`;
  directoryTabs.forEach((tab) => {
    const filter = tab.dataset.filter;
    const count = filter === 'all' ? window.POWER_NOTES.length : window.POWER_NOTES.filter((note) => note.category === filter).length;
    const badge = tab.querySelector('b');
    if (badge) badge.textContent = count;
  });
}

function updateDirectoryUrl() {
  const params = new URLSearchParams();
  if (directoryFilter !== 'all') params.set('category', directoryFilter);
  if (directoryPath !== 'all') params.set('path', directoryPath);
  const query = params.toString();
  history.pushState({}, '', `library.html${query ? `?${query}` : ''}`);
}

function selectDirectoryPath(path) {
  directoryPath = pathKey(path);
  directoryFilter = selectedRoot();
  updateDirectoryUrl();
  renderDirectory();
}

function renderDirectory() {
  normalizeDirectoryState();
  const query = directorySearch.value.trim().toLowerCase();
  const notes = window.POWER_NOTES.filter((note) => {
    const labels = Array.isArray(note.categoryPath) ? window.getTaxonomyLabels(note.categoryPath).join(' ') : note.categoryLabel;
    const haystack = `${note.title} ${note.categoryLabel} ${labels} ${note.summary} ${directoryMarkdownIndex.get(note.slug) || ''}`.toLowerCase();
    return noteMatchesDirectory(note) && (!query || haystack.includes(query));
  });
  directoryList.innerHTML = notes.map((note) => { const labels = Array.isArray(note.categoryPath) ? window.getTaxonomyLabels(note.categoryPath) : [note.categoryLabel]; return `<a class="directory-row" href="${escapeAttribute(noteHref(note))}"><span class="directory-index">${escapeHtml(note.number)}<small>${escapeHtml(note.categoryLabel)}</small></span><span class="directory-main"><strong>${escapeHtml(note.title)}</strong><small>${escapeHtml(note.summary)}</small><small class="directory-path">${labels.map(escapeHtml).join(' / ')}</small></span><span class="directory-date">${escapeHtml(note.date)}<br><small>${escapeHtml(note.readTime)}</small></span><span class="note-arrow">↗</span></a>`; }).join('');
  directoryCount.textContent = query ? `${notes.length} 条匹配笔记` : `${notes.length} 条笔记`;
  directoryEmpty.hidden = notes.length > 0;
  directoryTabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.filter === directoryFilter));
  renderTaxonomy();
}

taxonomyTree.addEventListener('click', (event) => {
  const expander = event.target.closest('.taxonomy-expander');
  if (expander && expander.parentElement.dataset.level) {
    const item = expander.closest('.taxonomy-item');
    const path = item.dataset.path;
    if (expandedPaths.has(path)) expandedPaths.delete(path); else expandedPaths.add(path);
    renderTaxonomy();
    return;
  }
  const selector = event.target.closest('.taxonomy-select');
  if (selector) selectDirectoryPath(selector.dataset.path);
});
directoryTabs.forEach((tab) => tab.addEventListener('click', () => { directoryFilter = tab.dataset.filter; directoryPath = directoryFilter; updateDirectoryUrl(); renderDirectory(); }));
directorySearch.addEventListener('input', renderDirectory);
window.addEventListener('popstate', () => { const params = new URLSearchParams(location.search); directoryFilter = params.get('category') || 'all'; directoryPath = params.get('path') || directoryFilter; renderDirectory(); });
document.addEventListener('keydown', (event) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); directorySearch.focus(); } });
renderDirectory();
Promise.all(window.POWER_NOTES.map(async (note) => {
  try {
    const response = await fetch(note.file);
    if (response.ok) directoryMarkdownIndex.set(note.slug, (await response.text()).toLowerCase());
  } catch (_) {
    // Metadata search remains available when a Markdown file cannot be fetched.
  }
})).then(renderDirectory);
