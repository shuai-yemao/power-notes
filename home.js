const homeTotalNotes = document.querySelector('#homeTotalNotes');

if (homeTotalNotes && Array.isArray(window.POWER_NOTES)) {
  homeTotalNotes.textContent = String(window.POWER_NOTES.length).padStart(2, '0');
}

if (Array.isArray(window.POWER_NOTES)) {
  const categoryCounts = window.POWER_NOTES.reduce((counts, note) => {
    counts[note.category] = (counts[note.category] || 0) + 1;
    return counts;
  }, {});
  document.querySelectorAll('[data-category-count]').forEach((element) => {
    element.textContent = categoryCounts[element.dataset.categoryCount] || '0';
  });
  const libraryHomeTotal = document.querySelector('#libraryHomeTotal');
  if (libraryHomeTotal) libraryHomeTotal.textContent = `${window.POWER_NOTES.length} NOTES`;
}
