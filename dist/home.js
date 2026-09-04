const homeTotalNotes = document.querySelector('#homeTotalNotes');

if (homeTotalNotes && Array.isArray(window.POWER_NOTES)) {
  homeTotalNotes.textContent = String(window.POWER_NOTES.length).padStart(2, '0');
}
