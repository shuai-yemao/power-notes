const directoryList = document.querySelector('#directoryList');
const directoryCount = document.querySelector('#directoryCount');
const directoryEmpty = document.querySelector('#directoryEmpty');
const directorySearch = document.querySelector('#librarySearch');
const directoryTabs = [...document.querySelectorAll('#directoryTabs .category')];
let directoryFilter = new URLSearchParams(location.search).get('category') || 'all';

function renderDirectory() {
  const query = directorySearch.value.trim().toLowerCase();
  const notes = window.POWER_NOTES.filter((note) => {
    const matchesCategory = directoryFilter === 'all' || note.category === directoryFilter;
    const haystack = `${note.title} ${note.categoryLabel} ${note.summary}`.toLowerCase();
    return matchesCategory && (!query || haystack.includes(query));
  });
  directoryList.innerHTML = notes.map((note) => `<a class="directory-row" href="note.html?slug=${note.slug}"><span class="directory-index">${note.number}<small>${note.categoryLabel}</small></span><span class="directory-main"><strong>${note.title}</strong><small>${note.summary}</small></span><span class="directory-date">${note.date}<br><small>${note.readTime}</small></span><span class="note-arrow">↗</span></a>`).join('');
  directoryCount.textContent = query ? `${notes.length} 条匹配笔记` : `${notes.length} 条笔记`;
  directoryEmpty.hidden = notes.length > 0;
  directoryTabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.filter === directoryFilter));
}

directoryTabs.forEach((tab) => tab.addEventListener('click', () => { directoryFilter = tab.dataset.filter; renderDirectory(); }));
directorySearch.addEventListener('input', renderDirectory);
document.addEventListener('keydown', (event) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); directorySearch.focus(); } });
renderDirectory();
