'use strict';

/**
 * To-Do List dengan status fleksibel, filter dinamis, dan localStorage.
 * Satu file JS saja sesuai brief. Minim error (try/catch, validasi).
 */

const STORAGE_KEY = 'todo_app_v2';
let todos = [];

// Util: escape HTML agar aman disisipkan ke DOM
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// Validasi input
function validateTask(task) {
  return typeof task === 'string' && task.trim().length >= 3;
}
function validateStatus(status) {
  if (!status) return true; // status boleh kosong, akan dianggap "Unspecified"
  const s = status.trim();
  if (s.length < 2) return false;
  // hanya huruf, angka, spasi, dash, underscore
  return /^[\w\s\-]+$/.test(s);
}
function normalizeStatus(status) {
  const s = (status || '').trim();
  return s.length ? s : 'Unspecified';
}

// Storage
function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (err) {
    console.error('Gagal menyimpan ke storage:', err);
  }
}
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Gagal membaca storage, akan reset:', err);
    return [];
  }
}

// Status unik untuk filter
function getUniqueStatuses() {
  const set = new Set(todos.map(t => t.status));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}
function updateFilterOptions() {
  const select = document.getElementById('filter');
  if (!select) return;
  const current = select.value;
  select.innerHTML = '<option value="all">Semua</option>';
  getUniqueStatuses().forEach(status => {
    const opt = document.createElement('option');
    opt.value = status;
    opt.textContent = status;
    select.appendChild(opt);
  });
  // kembalikan pilihan sebelumnya jika ada
  const hasPrev = Array.from(select.options).some(o => o.value === current);
  select.value = hasPrev ? current : 'all';
}

// Render
function renderTodos(filter = 'all') {
  const tbody = document.querySelector('#todo-table tbody');
  const empty = document.getElementById('empty-state');
  if (!tbody || !empty) return;

  tbody.innerHTML = '';
  const list = todos.filter(t => filter === 'all' ? true : t.status === filter);

  if (list.length === 0) {
    empty.hidden = false;
    return;
  } else {
    empty.hidden = true;
  }

  list.forEach(t => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(t.task)}</td>
      <td>${t.due ? escapeHtml(t.due) : '-'}</td>
      <td><span class="badge">${escapeHtml(t.status)}</span></td>
      <td>
        <button class="danger" data-action="delete" data-id="${t.id}">Hapus</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// CRUD
function addTodo({ task, due, status }) {
  const todo = {
    id: Date.now().toString(),
    task: task.trim(),
    due: due || '',
    status: normalizeStatus(status)
  };
  todos.push(todo);
  saveToStorage();
  updateFilterOptions();
  renderTodos(document.getElementById('filter').value);
}
function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveToStorage();
  updateFilterOptions();
  renderTodos(document.getElementById('filter').value);
}
function clearAll() {
  if (!confirm('Hapus semua tugas?')) return;
  todos = [];
  saveToStorage();
  updateFilterOptions();
  renderTodos('all');
}

// Event handlers
function onSubmit(e) {
  e.preventDefault();
  const taskEl = document.getElementById('task');
  const dueEl = document.getElementById('due');
  const statusEl = document.getElementById('status');

  const task = taskEl.value;
  const due = dueEl.value;
  const status = statusEl.value;

  // validasi
  const taskValid = validateTask(task);
  const statusValid = validateStatus(status);

  document.getElementById('task-error').hidden = taskValid;
  document.getElementById('status-error').hidden = statusValid;

  if (!taskValid || !statusValid) return;

  addTodo({ task, due, status });
  e.target.reset();
}
function onTableClick(e) {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = btn.dataset.id;
  const action = btn.dataset.action;
  if (action === 'delete') deleteTodo(id);
}
function onFilterChange(e) {
  renderTodos(e.target.value);
}
function onResetFilter() {
  const filterEl = document.getElementById('filter');
  filterEl.value = 'all';
  renderTodos('all');
}

function init() {
  // Load
  todos = loadFromStorage();

  // Events
  document.getElementById('todo-form').addEventListener('submit', onSubmit);
  document.getElementById('clear-btn').addEventListener('click', clearAll);
  document.querySelector('#todo-table tbody').addEventListener('click', onTableClick);
  document.getElementById('filter').addEventListener('change', onFilterChange);
  document.getElementById('reset-filter').addEventListener('click', onResetFilter);

  // First render
  updateFilterOptions();
  renderTodos('all');
}

document.addEventListener('DOMContentLoaded', init);