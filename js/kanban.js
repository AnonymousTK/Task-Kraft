/* ==========================================================================
   TK TASKKRAFT STUDIO - KANBAN TASK BOARD MODULE
   ========================================================================== */

window.TK_Kanban = {
  
  // Render Kanban Columns & Task Cards
  renderBoard: function() {
    const searchQuery = (document.getElementById('kanban-search')?.value || '').toLowerCase();
    const priorityFilter = document.getElementById('kanban-priority-filter')?.value || 'all';

    const columns = {
      todo: document.getElementById('list-todo'),
      in_progress: document.getElementById('list-in_progress'),
      review: document.getElementById('list-review'),
      completed: document.getElementById('list-completed')
    };

    const counts = { todo: 0, in_progress: 0, review: 0, completed: 0 };

    // Clear column contents
    Object.values(columns).forEach(col => { if (col) col.innerHTML = ''; });

    const filteredTasks = window.TK.tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery) || 
                            (task.desc && task.desc.toLowerCase().includes(searchQuery));
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });

    filteredTasks.forEach(task => {
      if (counts[task.status] !== undefined) counts[task.status]++;
      
      const card = this.createTaskCardElement(task);
      if (columns[task.status]) {
        columns[task.status].appendChild(card);
      }
    });

    // Update column count indicators
    Object.keys(counts).forEach(status => {
      const countEl = document.getElementById(`count-${status}`);
      if (countEl) countEl.textContent = counts[status];
    });

    this.setupDragAndDrop();
  },

  // Create single Task Card Element
  createTaskCardElement: function(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.setAttribute('draggable', 'true');
    card.setAttribute('data-id', task.id);

    const subtasks = task.subtasks || [];
    const completedSub = subtasks.filter(s => s.done).length;
    const subProgress = subtasks.length > 0 ? Math.round((completedSub / subtasks.length) * 100) : 0;

    const badgeClass = `badge-${task.priority}`;

    card.innerHTML = `
      <div class="task-tags">
        <span class="badge ${badgeClass}">${task.priority}</span>
      </div>
      <div class="task-title">${this.escapeHtml(task.title)}</div>
      ${task.desc ? `<div class="task-desc">${this.escapeHtml(task.desc)}</div>` : ''}
      
      ${subtasks.length > 0 ? `
        <div class="subtask-progress">
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${subProgress}%;"></div>
          </div>
          <div class="subtask-text">
            <span><i class="fa-solid fa-list-check"></i> Check List</span>
            <span>${completedSub}/${subtasks.length}</span>
          </div>
        </div>
      ` : ''}

      <div class="task-footer">
        <div class="task-due">
          <i class="fa-regular fa-calendar"></i>
          <span>${task.dueDate || 'No Due Date'}</span>
        </div>
        <div class="task-actions">
          <button class="task-action-btn edit-task-btn" title="Edit Card"><i class="fa-solid fa-pen"></i></button>
          <button class="task-action-btn delete-task-btn" title="Delete Card"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    `;

    // Action button listeners
    card.querySelector('.edit-task-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openTaskModal(task);
    });

    card.querySelector('.delete-task-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.deleteTask(task.id);
    });

    return card;
  },

  // Setup HTML5 Drag and Drop across Kanban columns
  setupDragAndDrop: function() {
    const cards = document.querySelectorAll('.task-card');
    const lists = document.querySelectorAll('.task-list');

    let draggedCard = null;

    cards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        draggedCard = card;
        card.classList.add('dragging');
        e.dataTransfer.setData('text/plain', card.getAttribute('data-id'));
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        draggedCard = null;
      });
    });

    lists.forEach(list => {
      list.addEventListener('dragover', (e) => {
        e.preventDefault();
        list.classList.add('drag-over');
      });

      list.addEventListener('dragleave', () => {
        list.classList.remove('drag-over');
      });

      list.addEventListener('drop', (e) => {
        e.preventDefault();
        list.classList.remove('drag-over');
        
        const taskId = e.dataTransfer.getData('text/plain');
        const targetColumn = list.closest('.kanban-column');
        const newStatus = targetColumn?.getAttribute('data-status');

        if (taskId && newStatus) {
          this.updateTaskStatus(taskId, newStatus);
        }
      });
    });
  },

  // Update status of a task
  updateTaskStatus: function(taskId, newStatus) {
    const task = window.TK.tasks.find(t => t.id === taskId);
    if (!task) return;

    const oldStatus = task.status;
    task.status = newStatus;
    window.TK.saveData();
    this.renderBoard();

    if (newStatus === 'completed' && oldStatus !== 'completed') {
      window.TK.showToast(`Task "${task.title}" completed! 🎉`, 'fa-circle-check', 'emerald');
      if (typeof confetti === 'function') {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }
    }
  },

  // Task Modal (Create / Edit)
  openTaskModal: function(task = null) {
    const modal = document.getElementById('task-modal');
    const titleEl = document.getElementById('modal-task-title');
    const form = document.getElementById('task-form');

    if (!modal || !form) return;

    if (task) {
      titleEl.textContent = 'Edit Task';
      document.getElementById('task-id').value = task.id;
      document.getElementById('task-input-title').value = task.title;
      document.getElementById('task-input-desc').value = task.desc || '';
      document.getElementById('task-input-status').value = task.status;
      document.getElementById('task-input-priority').value = task.priority;
      document.getElementById('task-input-due').value = task.dueDate || '';
    } else {
      titleEl.textContent = 'Add New Task';
      form.reset();
      document.getElementById('task-id').value = '';
    }

    modal.classList.add('active');
  },

  closeTaskModal: function() {
    const modal = document.getElementById('task-modal');
    if (modal) modal.classList.remove('active');
  },

  saveTaskFromForm: function() {
    const id = document.getElementById('task-id').value;
    const title = document.getElementById('task-input-title').value.trim();
    const desc = document.getElementById('task-input-desc').value.trim();
    const status = document.getElementById('task-input-status').value;
    const priority = document.getElementById('task-input-priority').value;
    const dueDate = document.getElementById('task-input-due').value;

    if (!title) return;

    if (id) {
      // Edit existing task
      const task = window.TK.tasks.find(t => t.id === id);
      if (task) {
        task.title = title;
        task.desc = desc;
        task.status = status;
        task.priority = priority;
        task.dueDate = dueDate;
      }
    } else {
      // Create new task
      const newTask = {
        id: 'task-' + Date.now(),
        title,
        desc,
        status,
        priority,
        dueDate,
        subtasks: []
      };
      window.TK.tasks.unshift(newTask);
    }

    window.TK.saveData();
    this.closeTaskModal();
    this.renderBoard();
    window.TK.showToast('Task saved successfully!', 'fa-circle-check');
  },

  deleteTask: function(taskId) {
    if (confirm('Are you sure you want to delete this task card?')) {
      window.TK.tasks = window.TK.tasks.filter(t => t.id !== taskId);
      window.TK.saveData();
      this.renderBoard();
      window.TK.showToast('Task deleted', 'fa-trash', 'rose');
    }
  },

  escapeHtml: function(str) {
    return String(str).replace(/[&<>"']/g, function(m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  }
};

// Initialize Kanban Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('kanban-search');
  const priorityFilter = document.getElementById('kanban-priority-filter');
  const boardAddBtn = document.getElementById('btn-board-add-task');
  const closeBtn = document.getElementById('btn-close-task-modal');
  const cancelBtn = document.getElementById('btn-cancel-task');
  const form = document.getElementById('task-form');

  if (searchInput) searchInput.addEventListener('input', () => window.TK_Kanban.renderBoard());
  if (priorityFilter) priorityFilter.addEventListener('change', () => window.TK_Kanban.renderBoard());
  if (boardAddBtn) boardAddBtn.addEventListener('click', () => window.TK_Kanban.openTaskModal());
  if (closeBtn) closeBtn.addEventListener('click', () => window.TK_Kanban.closeTaskModal());
  if (cancelBtn) cancelBtn.addEventListener('click', () => window.TK_Kanban.closeTaskModal());

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      window.TK_Kanban.saveTaskFromForm();
    });
  }

  window.TK_Kanban.renderBoard();
});
