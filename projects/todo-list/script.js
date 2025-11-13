// DOM Elements
const list = document.querySelector('#todo-list');
const emptyState = document.querySelector('#empty-state');
const form = document.querySelector('#todo-form');
const input = document.querySelector('#todo-input');
const priority = document.querySelector('#priority');
const dueDate = document.querySelector('#due-date');
const category = document.querySelector('#category');
const search = document.querySelector('#search');
const filters = document.querySelectorAll('.filter');
const clearCompleted = document.querySelector('#clear-completed');
const clearAll = document.querySelector('#clear-all');
const exportBtn = document.querySelector('#export-tasks');
const undoBtn = document.querySelector('#undo');
const stats = document.querySelector('#stats');
const progress = document.querySelector('#progress');
const toast = document.querySelector('#toast');
const toggleDark = document.querySelector('#toggle-dark');
const toggleNotifications = document.querySelector('#toggle-notifications');
const settingsPanel = document.querySelector('.settings-panel');
const closeSettings = document.querySelector('.close-settings');
const settingsForm = document.querySelector('#settings-form');
const defaultPriority = document.querySelector('#default-priority');
const notificationsToggle = document.querySelector('#notifications');

// State
let todos = [];
let undoStack = [];
let settings = {
  defaultPriority: 'medium',
  notificationsEnabled: true
};
let filter = 'all';
const dbName = 'TodoListDB';
const storeName = 'todos';
let db;

// GSAP Animations
function animateTaskIn(el) {
  gsap.fromTo(el, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
}

function animateTaskOut(el, callback) {
  gsap.to(el, { opacity: 0, y: 20, duration: 0.3, ease: 'power2.in', onComplete: callback });
}

// Utility Functions
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function showToast(message, type = 'info') {
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => {
    toast.className = 'toast';
  }, 3000);
}

function updateStats() {
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const percentage = total ? Math.round((completed / total) * 100) : 0;
  stats.textContent = `${completed}/${total} tasks completed`;
  progress.textContent = `${percentage}% complete`;
}

function saveToUndo(action, data) {
  undoStack.push({ action, data });
  undoBtn.disabled = false;
}

// IndexedDB Setup
async function initDB() {
  try {
    db = await idb.openDB(dbName, 1, {
      upgrade(db) {
        db.createObjectStore(storeName, { keyPath: 'id' });
      }
    });
    todos = await db.getAll(storeName);
    render();
  } catch (error) {
    console.error('DB Error:', error);
    showToast('Failed to initialize storage', 'error');
  }
}

// CRUD Operations
async function addTodo(text, priority, dueDate, category) {
  const todo = {
    id: Date.now().toString(),
    text,
    completed: false,
    priority,
    dueDate,
    category,
    createdAt: new Date().toISOString()
  };
  todos.push(todo);
  saveToUndo('add', { todo });
  try {
    await db.put(storeName, todo);
    render();
    showToast('Task added!', 'success');
    if (settings.notificationsEnabled && dueDate) {
      scheduleNotification(todo);
    }
  } catch (error) {
    console.error('Add Error:', error);
    showToast('Failed to add task', 'error');
  }
}

async function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveToUndo('toggle', { id, completed: !todo.completed });
    try {
      await db.put(storeName, todo);
      render();
      showToast(`Task ${todo.completed ? 'completed' : 'reopened'}!`, 'success');
    } catch (error) {
      console.error('Toggle Error:', error);
      showToast('Failed to update task', 'error');
    }
  }
}

async function editTodo(id, newText) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    const oldText = todo.text;
    todo.text = newText;
    saveToUndo('edit', { id, oldText, newText });
    try {
      await db.put(storeName, todo);
      render();
      showToast('Task updated!', 'success');
    } catch (error) {
      console.error('Edit Error:', error);
      showToast('Failed to update task', 'error');
    }
  }
}

async function deleteTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todos = todos.filter(t => t.id !== id);
    saveToUndo('delete', { todo });
    try {
      await db.delete(storeName, id);
      render();
      showToast('Task deleted!', 'success');
    } catch (error) {
      console.error('Delete Error:', error);
      showToast('Failed to delete task', 'error');
    }
  }
}

async function clearCompletedTodos() {
  const toDelete = todos.filter(t => t.completed);
  todos = todos.filter(t => !t.completed);
  saveToUndo('clearCompleted', { todos: toDelete });
  try {
    const tx = db.transaction(storeName, 'readwrite');
    for (const todo of toDelete) {
      await tx.store.delete(todo.id);
    }
    await tx.done;
    render();
    showToast('Completed tasks cleared!', 'success');
  } catch (error) {
    console.error('Clear Completed Error:', error);
    showToast('Failed to clear tasks', 'error');
  }
}

async function clearAllTodos() {
  saveToUndo('clearAll', { todos: [...todos] });
  todos = [];
  try {
    await db.clear(storeName);
    render();
    showToast('All tasks cleared!', 'success');
  } catch (error) {
    console.error('Clear All Error:', error);
    showToast('Failed to clear tasks', 'error');
  }
}

// Filtering and Sorting
function filterAndSort(todos) {
  let filtered = [...todos];
  if (filter === 'active') {
    filtered = filtered.filter(t => !t.completed);
  } else if (filter === 'completed') {
    filtered = filtered.filter(t => t.completed);
  }
  const query = search.value.trim().toLowerCase();
  if (query) {
    filtered = filtered.filter(t => t.text.toLowerCase().includes(query));
  }
  return filtered.sort((a, b) => {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority] || new Date(a.createdAt) - new Date(b.createdAt);
  });
}

// Rendering
function render() {
  list.innerHTML = '';
  const visibleTasks = filterAndSort(todos);
  emptyState.classList.toggle('hidden', visibleTasks.length > 0);
  visibleTasks.forEach(t => {
    const li = document.createElement('li');
    if (t.completed) li.classList.add('completed');
    li.dataset.id = t.id;
    li.innerHTML = `
      <input type="checkbox" ${t.completed ? 'checked' : ''} aria-label="Toggle task completion">
      <span class="label">${escapeHtml(t.text)}</span>
      <div class="badges">
        ${t.priority ? `<span class="badge priority-${t.priority}">${t.priority}</span>` : ''}
        ${t.dueDate ? `<span class="badge due">Due: ${formatDate(t.dueDate)}</span>` : ''}
        ${t.category ? `<span class="badge category">${t.category}</span>` : ''}
      </div>
      <div class="todo-actions">
        <button class="edit" title="Edit task" aria-label="Edit task">✏️</button>
        <button class="delete" title="Delete task" aria-label="Delete task">🗑️</button>
      </div>`;
    list.appendChild(li);
    animateTaskIn(li);
  });
  updateStats();
}

// Undo Functionality
function undo() {
  const lastAction = undoStack.pop();
  if (!lastAction) return;
  switch (lastAction.action) {
    case 'add':
      deleteTodo(lastAction.data.todo.id);
      break;
    case 'toggle':
      const todo = todos.find(t => t.id === lastAction.data.id);
      if (todo) {
        todo.completed = lastAction.data.completed;
        db.put(storeName, todo);
        render();
      }
      break;
    case 'edit':
      editTodo(lastAction.data.id, lastAction.data.oldText);
      break;
    case 'delete':
      todos.push(lastAction.data.todo);
      db.put(storeName, lastAction.data.todo);
      render();
      break;
    case 'clearCompleted':
      todos.push(...lastAction.data.todos);
      const tx = db.transaction(storeName, 'readwrite');
      lastAction.data.todos.forEach(t => tx.store.put(t));
      tx.done.then(() => render());
      break;
    case 'clearAll':
      todos = lastAction.data.todos;
      const tx2 = db.transaction(storeName, 'readwrite');
      lastAction.data.todos.forEach(t => tx2.store.put(t));
      tx2.done.then(() => render());
      break;
  }
  undoBtn.disabled = undoStack.length === 0;
  showToast('Action undone!', 'info');
}

// Export Tasks
function exportTasks() {
  const data = JSON.stringify(todos, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `todos_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Tasks exported!', 'success');
}

// Notifications
function scheduleNotification(todo) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const due = new Date(todo.dueDate);
  const now = new Date();
  if (due > now) {
    const timeUntilDue = due - now;
    setTimeout(() => {
      new Notification('Task Due!', {
        body: `Your task "${todo.text}" is due now!`,
        icon: 'favicon.svg'
      });
    }, timeUntilDue);
  }
}

// Settings
function saveSettings() {
  settings.defaultPriority = defaultPriority.value;
  settings.notificationsEnabled = notificationsToggle.checked;
  localStorage.setItem('todoSettings', JSON.stringify(settings));
  showToast('Settings saved!', 'success');
  settingsPanel.hidden = true;
}

function loadSettings() {
  const saved = localStorage.getItem('todoSettings');
  if (saved) {
    settings = JSON.parse(saved);
    defaultPriority.value = settings.defaultPriority;
    notificationsToggle.checked = settings.notificationsEnabled;
    priority.value = settings.defaultPriority;
  }
}

// Event Listeners
form.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) {
    showToast('Task cannot be empty', 'error');
    return;
  }
  addTodo(text, priority.value, dueDate.value, category.value);
  input.value = '';
  dueDate.value = '';
  priority.value = settings.defaultPriority;
  category.value = 'general';
});

list.addEventListener('click', e => {
  const id = e.target.closest('li')?.dataset.id;
  if (!id) return;
  if (e.target.matches('input[type="checkbox"]')) {
    toggleTodo(id);
  } else if (e.target.matches('.edit')) {
    const todo = todos.find(t => t.id === id);
    const newText = prompt('Edit task:', todo.text);
    if (newText?.trim()) editTodo(id, newText.trim());
  } else if (e.target.matches('.delete')) {
    animateTaskOut(e.target.closest('li'), () => deleteTodo(id));
  }
});

filters.forEach(f => f.addEventListener('click', () => {
  filters.forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-selected', 'false');
  });
  f.classList.add('active');
  f.setAttribute('aria-selected', 'true');
  filter = f.dataset.filter;
  render();
}));

search.addEventListener('input', render);
clearCompleted.addEventListener('click', clearCompletedTodos);
clearAll.addEventListener('click', () => {
  if (confirm('Clear all tasks?')) clearAllTodos();
});
exportBtn.addEventListener('click', exportTasks);
undoBtn.addEventListener('click', undo);
toggleDark.addEventListener('click', () => {
  document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
});
toggleNotifications.addEventListener('click', () => {
  if (Notification.permission !== 'granted') {
    Notification.requestPermission().then(perm => {
      if (perm === 'granted') showToast('Notifications enabled!', 'success');
    });
  }
});
closeSettings.addEventListener('click', () => {
  settingsPanel.hidden = true;
});
settingsForm.addEventListener('submit', e => {
  e.preventDefault();
  saveSettings();
});

// Keyboard Shortcuts
document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 'z') {
    e.preventDefault();
    undo();
  }
});

// Initialize
initDB();
loadSettings();
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}
