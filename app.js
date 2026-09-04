const body = document.body;
const themeToggle = document.querySelector('#themeToggle');
const searchInput = document.querySelector('#searchInput');
const categories = [...document.querySelectorAll('.category')];
const searchable = [...document.querySelectorAll('[data-search]')];
const resultCount = document.querySelector('#resultCount');
const emptyState = document.querySelector('#emptyState');
const categoryTotals = { all: 24, embedded: 8, software: 6, tools: 5, thinking: 5 };
const markdownSearchIndex = new Map();

function loadMarkdownSearchIndex() {
  if (!window.POWER_NOTES) return;
  Promise.all(window.POWER_NOTES.map(async (note) => {
    try {
      const response = await fetch(note.file);
      if (response.ok) markdownSearchIndex.set(note.slug, (await response.text()).toLowerCase());
    } catch (_) {
      // Metadata search remains available when a Markdown file cannot be fetched.
    }
  })).then(applyFilters);
}
let activeFilter = 'all';

function applyFilters() {
  if (!searchInput || !resultCount) return;
  const query = searchInput.value.trim().toLowerCase();
  let visibleNotes = 0;
  searchable.forEach((item) => {
    const matchesCategory = activeFilter === 'all' || item.dataset.category === activeFilter;
    const markdownText = item.dataset.slug ? (markdownSearchIndex.get(item.dataset.slug) || '') : '';
    const matchesQuery = !query || `${item.dataset.search} ${markdownText}`.toLowerCase().includes(query);
    const visible = matchesCategory && matchesQuery;
    item.hidden = !visible;
    if (visible) visibleNotes += 1;
  });
  resultCount.textContent = query ? `${visibleNotes} 条匹配笔记` : `${categoryTotals[activeFilter]} 条笔记`;
  if (emptyState) emptyState.hidden = visibleNotes > 0;
}

categories.forEach((button) => button.addEventListener('click', () => {
  categories.forEach((item) => item.classList.remove('active'));
  button.classList.add('active');
  activeFilter = button.dataset.filter;
  applyFilters();
}));

if (searchInput) searchInput.addEventListener('input', applyFilters);
document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k' && searchInput) {
    event.preventDefault();
    searchInput.focus();
  }
  if (event.key === 'Escape' && searchInput && document.activeElement === searchInput) {
    searchInput.value = '';
    searchInput.blur();
    applyFilters();
  }
});

const savedTheme = localStorage.getItem('power-notes-theme');
if (savedTheme === 'dark') body.classList.add('dark');
if (themeToggle) themeToggle.addEventListener('click', () => {
  body.classList.toggle('dark');
  localStorage.setItem('power-notes-theme', body.classList.contains('dark') ? 'dark' : 'light');
});
applyFilters();
loadMarkdownSearchIndex();
