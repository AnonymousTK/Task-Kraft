/* ==========================================================================
   TK TASKKRAFT STUDIO - CORE APP MODULE & STATE CONTROLLER
   ========================================================================== */

const STORAGE_KEY_TASKS = 'tk_taskkraft_tasks_v2';
const STORAGE_KEY_NOTES = 'tk_taskkraft_notes_v2';
const STORAGE_KEY_STATS = 'tk_taskkraft_stats_v2';

// Global Application State
window.TK = {
  tasks: [],
  notes: [],
  stats: {
    focusSeconds: 1500,
    streakDays: 7,
    completedCount: 0
  },
  currentView: 'dashboard',
  activeNoteId: null,

  // Toast Notification System
  showToast: function(message, icon = 'fa-circle-check', type = 'primary') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.borderLeftColor = `var(--${type === 'rose' ? 'accent-rose' : 'primary'})`;
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  // Save state to LocalStorage
  saveData: function() {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(this.tasks));
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(this.notes));
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(this.stats));
    
    this.updateBadgesAndStats();
    if (window.TK_Analytics && window.TK_Analytics.refreshCharts) {
      window.TK_Analytics.refreshCharts();
    }
  },

  // Load state from LocalStorage or seed default data
  loadData: function() {
    const rawTasks = localStorage.getItem(STORAGE_KEY_TASKS);
    const rawNotes = localStorage.getItem(STORAGE_KEY_NOTES);
    const rawStats = localStorage.getItem(STORAGE_KEY_STATS);

    if (rawTasks) {
      this.tasks = JSON.parse(rawTasks);
    } else {
      this.seedDefaultTasks();
    }

    if (rawNotes) {
      this.notes = JSON.parse(rawNotes);
    } else {
      this.seedDefaultNotes();
    }

    if (rawStats) {
      this.stats = JSON.parse(rawStats);
    }

    this.saveData();
  },

  // Seed default demonstration tasks
  seedDefaultTasks: function() {
    this.tasks = [
      {
        id: 'task-1',
        title: 'Architect TK TaskKraft Glassmorphic UI System',
        desc: 'Build dark-mode CSS custom tokens, glass cards, neon highlights, and smooth view transitions.',
        status: 'completed',
        priority: 'urgent',
        dueDate: '2026-08-06',
        subtasks: [
          { text: 'Design CSS variables & themes', done: true },
          { text: 'Implement glassmorphic backdrop filter', done: true }
        ]
      },
      {
        id: 'task-2',
        title: 'Integrate Web Audio Focus Soundscape Engine',
        desc: 'Create procedural ambient noise synth for white noise, rain, and deep space audio.',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2026-08-07',
        subtasks: [
          { text: 'Web Audio API noise buffer oscillator', done: true },
          { text: 'Sound toggle UI controls', done: false }
        ]
      },
      {
        id: 'task-3',
        title: 'Setup Chart.js Live Velocity Analytics',
        desc: 'Configure real-time task completion line chart and priority breakdown ring.',
        status: 'review',
        priority: 'medium',
        dueDate: '2026-08-08',
        subtasks: [
          { text: 'Chart canvas binding', done: true },
          { text: 'Dynamic refresh trigger', done: true }
        ]
      },
      {
        id: 'task-4',
        title: 'Publish TK Developer Utility Toolbox',
        desc: 'JSON Prettifier, Base64 converter, Regex matcher, and Color palette generator.',
        status: 'todo',
        priority: 'low',
        dueDate: '2026-08-10',
        subtasks: [
          { text: 'JSON parser error catching', done: false },
          { text: 'Clipboard instant copy', done: false }
        ]
      }
    ];
  },

  // Seed default markdown notes
  seedDefaultNotes: function() {
    this.notes = [
      {
        id: 'note-1',
        title: '🚀 Welcome to TK TaskKraft Studio',
        content: `# Welcome to TK TaskKraft Studio\n\n**TK TaskKraft Studio** is an ultra-fast, offline-first workstation.\n\n### Key Features:\n- ⚡ **Kanban Board** with drag-and-drop workflow.\n- ⏱️ **Focus Timer & Soundscapes** powered by Web Audio API.\n- 📊 **Chart.js Analytics** for real-time velocity.\n- 🛠️ **Dev Utilities** for formatting JSON, testing Regex, & palette generation.\n\nEnjoy maximum focus!`
      },
      {
        id: 'note-2',
        title: '💡 Project Architecture Notes',
        content: `# Project Architecture\n\n- Uses pure HTML5, modern CSS3 variables, and vanilla ES6 JavaScript.\n- Persistent storage powered by \`localStorage\`.\n- Web Audio API procedural synthesis for ambient sounds.`
      }
    ];
  },

  // Update UI Stats & Badges
  updateBadgesAndStats: function() {
    // Badges
    const kanbanBadge = document.getElementById('kanban-total-badge');
    const notesBadge = document.getElementById('notes-total-badge');
    if (kanbanBadge) kanbanBadge.textContent = this.tasks.length;
    if (notesBadge) notesBadge.textContent = this.notes.length;

    // Stat Cards
    const totalEl = document.getElementById('stat-total-tasks');
    const completedEl = document.getElementById('stat-completed-tasks');
    const focusEl = document.getElementById('stat-focus-time');
    const streakEl = document.getElementById('stat-streak');

    const completedCount = this.tasks.filter(t => t.status === 'completed').length;
    
    if (totalEl) totalEl.textContent = this.tasks.length;
    if (completedEl) completedEl.textContent = completedCount;
    if (focusEl) focusEl.textContent = `${Math.round(this.stats.focusSeconds / 60)}m`;
    if (streakEl) streakEl.textContent = `${this.stats.streakDays} Days`;

    // Render Recent List on Dashboard
    this.renderDashboardRecent();
  },

  // Render recent activity on dashboard
  renderDashboardRecent: function() {
    const listEl = document.getElementById('dashboard-recent-list');
    if (!listEl) return;

    listEl.innerHTML = '';
    const recentTasks = [...this.tasks].slice(0, 4);

    if (recentTasks.length === 0) {
      listEl.innerHTML = `<p style="color: var(--text-dim); font-size: 13px;">No tasks found.</p>`;
      return;
    }

    recentTasks.forEach(task => {
      const item = document.createElement('div');
      item.className = 'glass-card';
      item.style.padding = '12px 16px';
      item.style.display = 'flex';
      item.style.alignItems = 'center';
      item.style.justifySpaceBetween = 'space-between';
      item.style.borderRadius = 'var(--radius-md)';
      
      const badgeClass = `badge-${task.priority}`;
      item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <span class="badge ${badgeClass}">${task.priority}</span>
          <span style="font-weight: 600; font-size: 13px; color: var(--text-main);">${task.title}</span>
        </div>
        <span style="font-size: 11px; color: var(--text-dim); font-weight: 500;">${task.status.replace('_', ' ').toUpperCase()}</span>
      `;
      listEl.appendChild(item);
    });
  },

  // Switch View Panels
  switchView: function(viewId) {
    this.currentView = viewId;
    
    // Update nav link active state
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.getAttribute('data-view') === viewId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update view panels
    document.querySelectorAll('.view-panel').forEach(panel => {
      if (panel.id === `view-${viewId}`) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });

    // Update Top Header Titles
    const titles = {
      dashboard: { main: 'Dashboard Overview', sub: 'Track performance, manage active sprints, and optimize workflow' },
      kanban: { main: 'Kanban Task Board', sub: 'Drag and drop cards across sprint phases to update progress' },
      timer: { main: 'Focus Timer & Soundscapes', sub: 'Deep work timer linked to procedural Web Audio sound generators' },
      notes: { main: 'Markdown Workspace', sub: 'Live dual-pane Markdown editor with persistent local storage' },
      tools: { main: 'Developer & Creator Utilities', sub: 'Essential suite for formatting JSON, testing Regex, and color palettes' },
      analytics: { main: 'Performance Analytics', sub: 'Visual breakdown of velocity, task distribution, and metrics' }
    };

    const info = titles[viewId] || titles.dashboard;
    document.getElementById('header-view-title').textContent = info.main;
    document.getElementById('header-view-subtitle').textContent = info.sub;

    // Trigger re-renders if needed
    if (viewId === 'kanban' && window.TK_Kanban) window.TK_Kanban.renderBoard();
    if (viewId === 'notes' && window.TK_Notes) window.TK_Notes.renderList();
    if (viewId === 'analytics' && window.TK_Analytics) window.TK_Analytics.refreshCharts();
  },

  // Setup Command Palette
  setupCommandPalette: function() {
    const cmdModal = document.getElementById('cmd-modal');
    const cmdInput = document.getElementById('cmd-search-input');
    const resultsList = document.getElementById('cmd-results-list');
    const openBtn = document.getElementById('btn-open-cmd');

    const commands = [
      { name: 'Dashboard Overview', action: () => this.switchView('dashboard'), icon: 'fa-chart-pie' },
      { name: 'Kanban Task Board', action: () => this.switchView('kanban'), icon: 'fa-list-check' },
      { name: 'Focus Timer', action: () => this.switchView('timer'), icon: 'fa-stopwatch' },
      { name: 'Markdown Notes', action: () => this.switchView('notes'), icon: 'fa-note-sticky' },
      { name: 'Dev Utilities', action: () => this.switchView('tools'), icon: 'fa-wrench' },
      { name: 'Performance Analytics', action: () => this.switchView('analytics'), icon: 'fa-chart-line' },
      { name: 'Add New Task', action: () => { if (window.TK_Kanban) window.TK_Kanban.openTaskModal(); }, icon: 'fa-plus' },
      { name: 'Export Workspace Backup', action: () => this.exportBackup(), icon: 'fa-download' }
    ];

    const renderResults = (query = '') => {
      resultsList.innerHTML = '';
      const filtered = commands.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
      
      filtered.forEach(cmd => {
        const item = document.createElement('div');
        item.style.padding = '10px 14px';
        item.style.borderRadius = 'var(--radius-md)';
        item.style.background = 'rgba(255,255,255,0.04)';
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.gap = '12px';
        item.style.cursor = 'pointer';
        item.style.fontSize = '13px';
        item.style.color = 'var(--text-main)';

        item.innerHTML = `<i class="fa-solid ${cmd.icon}" style="color: var(--primary);"></i> <span>${cmd.name}</span>`;
        
        item.addEventListener('click', () => {
          cmd.action();
          cmdModal.classList.remove('active');
        });
        
        item.addEventListener('mouseenter', () => { item.style.background = 'rgba(99,102,241,0.2)'; });
        item.addEventListener('mouseleave', () => { item.style.background = 'rgba(255,255,255,0.04)'; });

        resultsList.appendChild(item);
      });
    };

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        cmdModal.classList.add('active');
        cmdInput.value = '';
        cmdInput.focus();
        renderResults();
      });
    }

    if (cmdInput) {
      cmdInput.addEventListener('input', (e) => renderResults(e.target.value));
    }

    // Shortcut listener: Ctrl+K or Cmd+K
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        cmdModal.classList.add('active');
        cmdInput.value = '';
        cmdInput.focus();
        renderResults();
      }
      if (e.key === 'Escape' && cmdModal.classList.contains('active')) {
        cmdModal.classList.remove('active');
      }
    });

    cmdModal.addEventListener('click', (e) => {
      if (e.target === cmdModal) cmdModal.classList.remove('active');
    });
  },

  // Export JSON workspace backup
  exportBackup: function() {
    const data = {
      tasks: this.tasks,
      notes: this.notes,
      stats: this.stats,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TK_TaskKraft_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.showToast('Workspace backup exported successfully!', 'fa-download');
  }
};

// Initialize Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.TK.loadData();

  // Navigation Click Binding
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const view = item.getAttribute('data-view');
      window.TK.switchView(view);
    });
  });

  // Export Button Binding
  const exportBtn = document.getElementById('btn-quick-export');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => window.TK.exportBackup());
  }

  // Header Add Task Button Binding
  const addBtn = document.getElementById('btn-header-add-task');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      if (window.TK_Kanban) window.TK_Kanban.openTaskModal();
    });
  }

  // Command Palette
  window.TK.setupCommandPalette();

  // Initial View Setup
  window.TK.switchView('dashboard');
});
