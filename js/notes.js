/* ==========================================================================
   TK TASKKRAFT STUDIO - MARKDOWN NOTES WORKSPACE MODULE
   ========================================================================== */

window.TK_Notes = {
  activeNoteId: null,

  init: function() {
    this.renderList();

    const titleInput = document.getElementById('note-title-input');
    const markdownInput = document.getElementById('note-markdown-input');
    const saveBtn = document.getElementById('btn-save-note');
    const deleteBtn = document.getElementById('btn-delete-note');
    const newBtn = document.getElementById('btn-new-note');

    if (markdownInput) {
      markdownInput.addEventListener('input', () => this.updateLivePreview());
    }

    if (titleInput) {
      titleInput.addEventListener('input', () => this.autoSaveActiveNote());
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveActiveNote());
    }

    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => this.deleteActiveNote());
    }

    if (newBtn) {
      newBtn.addEventListener('click', () => this.createNewNote());
    }
  },

  renderList: function() {
    const container = document.getElementById('notes-list-container');
    if (!container) return;

    container.innerHTML = '';

    if (window.TK.notes.length === 0) {
      container.innerHTML = `<p style="color: var(--text-dim); font-size: 13px; text-align: center; padding: 20px;">No notes created yet.</p>`;
      return;
    }

    window.TK.notes.forEach(note => {
      const item = document.createElement('div');
      item.className = `note-item ${note.id === this.activeNoteId ? 'active' : ''}`;
      item.innerHTML = `
        <div class="note-item-title">${this.escapeHtml(note.title || 'Untitled Note')}</div>
        <div class="note-item-snippet">${this.escapeHtml((note.content || '').slice(0, 50))}...</div>
      `;

      item.addEventListener('click', () => this.selectNote(note.id));
      container.appendChild(item);
    });

    if (!this.activeNoteId && window.TK.notes.length > 0) {
      this.selectNote(window.TK.notes[0].id);
    }
  },

  selectNote: function(noteId) {
    const note = window.TK.notes.find(n => n.id === noteId);
    if (!note) return;

    this.activeNoteId = noteId;
    window.TK.activeNoteId = noteId;

    const titleInput = document.getElementById('note-title-input');
    const markdownInput = document.getElementById('note-markdown-input');

    if (titleInput) titleInput.value = note.title || '';
    if (markdownInput) markdownInput.value = note.content || '';

    this.updateLivePreview();
    this.renderList();
  },

  createNewNote: function() {
    const newNote = {
      id: 'note-' + Date.now(),
      title: 'Untitled Note',
      content: '# New Note\n\nStart writing Markdown content here...'
    };

    window.TK.notes.unshift(newNote);
    window.TK.saveData();
    this.selectNote(newNote.id);
    window.TK.showToast('New note created!', 'fa-plus');
  },

  updateLivePreview: function() {
    const markdownInput = document.getElementById('note-markdown-input');
    const previewEl = document.getElementById('note-markdown-preview');
    
    if (!markdownInput || !previewEl) return;

    const raw = markdownInput.value;
    if (typeof marked !== 'undefined') {
      previewEl.innerHTML = marked.parse(raw);
    } else {
      previewEl.textContent = raw;
    }

    this.autoSaveActiveNote();
  },

  autoSaveActiveNote: function() {
    if (!this.activeNoteId) return;

    const note = window.TK.notes.find(n => n.id === this.activeNoteId);
    if (!note) return;

    const titleInput = document.getElementById('note-title-input');
    const markdownInput = document.getElementById('note-markdown-input');

    note.title = titleInput ? titleInput.value : note.title;
    note.content = markdownInput ? markdownInput.value : note.content;

    window.TK.saveData();
  },

  saveActiveNote: function() {
    this.autoSaveActiveNote();
    window.TK.showToast('Note saved persistently!', 'fa-floppy-disk');
  },

  deleteActiveNote: function() {
    if (!this.activeNoteId) return;

    if (confirm('Delete this note?')) {
      window.TK.notes = window.TK.notes.filter(n => n.id !== this.activeNoteId);
      this.activeNoteId = null;
      window.TK.saveData();
      this.renderList();
      window.TK.showToast('Note deleted', 'fa-trash', 'rose');
    }
  },

  escapeHtml: function(str) {
    return String(str).replace(/[&<>"']/g, function(m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  }
};

// Initialize Notes on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.TK_Notes.init();
});
