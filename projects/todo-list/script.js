const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const stats = document.getElementById('stats');
const clearBtn = document.getElementById('clear-completed');
const toast = document.getElementById('toast');
const toggleDark = document.getElementById('toggle-dark');

let todos = JSON.parse(localStorage.getItem('todos') || '[]');
let undoStack = [];

// Theme
const isDark = localStorage.getItem('dark-mode') === 'true';
if (isDark) document.body.classList.add('dark-mode');
toggleDark.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('dark-mode', document.body.classList.contains('dark-mode'));
});

function render() {
  list.innerHTML = '';
  const completed = todos.filter(t => t.completed).length;
  const total = todos.length;
  stats.textContent = `${total - completed}/${total}`;
  clearBtn.disabled = completed === 0;

  if (total === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
    todos.forEach((t, i) => {
      const li = document.createElement('li');
      if (t.completed) li.classList.add('completed');
      li.dataset.index = i;
      li.innerHTML = `
        <input type="checkbox" ${t.completed ? 'checked' : ''} aria-label="toggle task">
        <span class="label">${escapeHtml(t.text)}</span>
        <div class="todo-actions">
          <button class="edit" title="Edit">✏️</button>
          <button class="delete" title="Delete">🗑️</button>
        </div>
      `;
      list.appendChild(li);
    });
  }
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function save() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function showToast(msg, dur = 2000) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), dur);
}

function addTodo(text) {
  undoStack.push(JSON.stringify(todos));
  todos.push({ text, completed: false });
  input.value = '';
  save();
  render();
  showToast('Task added ✓');
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTodo(text);
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') input.blur();
});

list.addEventListener('click', (e) => {
  const li = e.target.closest('li');
  if (!li) return;
  const idx = Number(li.dataset.index);
  if (e.target.matches('input[type=checkbox]')) {
    todos[idx].completed = e.target.checked;
    save();
    render();
    showToast(e.target.checked ? '✓ Done!' : 'Unmarked');
  } else if (e.target.matches('.delete')) {
    if (confirm(`Delete "${todos[idx].text}"?`)) {
      undoStack.push(JSON.stringify(todos));
      todos.splice(idx, 1);
      save();
      render();
      showToast('Task deleted');
    }
  } else if (e.target.matches('.edit')) {
    const newText = prompt('Edit task:', todos[idx].text);
    if (newText !== null && newText.trim()) {
      undoStack.push(JSON.stringify(todos));
      todos[idx].text = newText.trim();
      save();
      render();
      showToast('Task updated ✓');
    }
  }
});

clearBtn.addEventListener('click', () => {
  const count = todos.filter(t => t.completed).length;
  if (count > 0 && confirm(`Delete ${count} completed task(s)?`)) {
    undoStack.push(JSON.stringify(todos));
    todos = todos.filter(t => !t.completed);
    save();
    render();
    showToast(`${count} task(s) cleared`);
  }
});

render();
