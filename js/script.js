// State aplikasi: satu sumber kebenaran
let todos = []; // { id, task, dueDate, status: 'pending'|'done' }

// Elemen DOM
const form = document.getElementById('todo-form');
const taskInput = document.getElementById('taskInput');
const dateInput = document.getElementById('dateInput');
const taskError = document.getElementById('taskError');
const dateError = document.getElementById('dateError');

const statusFilter = document.getElementById('statusFilter');
const dateFilter = document.getElementById('dateFilter');
const applyFilterBtn = document.getElementById('applyFilterBtn');
const clearFilterBtn = document.getElementById('clearFilterBtn');

const tableBody = document.getElementById('todoBody');
const emptyState = document.getElementById('emptyState');
const resetFormBtn = document.getElementById('resetFormBtn');

// Util: format tanggal ke ID
function formatDateISOToLocal(iso) {
  // iso: 'YYYY-MM-DD'
  if (!iso) return '';
  const [y,m,d] = iso.split('-');
  return ${d}/${m}/${y};
}

// Validasi form
function validateForm() {
  let valid = true;
  const taskVal = taskInput.value.trim();
  const dateVal = dateInput.value;

  // Task wajib, minimal 3 karakter
  if (!taskVal) {
    taskError.textContent = 'Nama tugas tidak boleh kosong.';
    valid = false;
  } else if (taskVal.length < 3) {
    taskError.textContent = 'Minimal 3 karakter.';
    valid = false;
  } else {
    taskError.textContent = '';
  }

  // Due date wajib, tidak boleh sebelum hari ini
  if (!dateVal) {
    dateError.textContent = 'Tanggal wajib diisi.';
    valid = false;
  } else {
    const today = new Date();
    today.setHours(0,0,0,0);
    const inputDate = new Date(dateVal);
    if (isNaN(inputDate.getTime())) {
      dateError.textContent = 'Format tanggal tidak valid.';
      valid = false;
    } else if (inputDate < today) {
      dateError.textContent = 'Tanggal tidak boleh mundur dari hari ini.';
      valid = false;
    } else {
      dateError.textContent = '';
    }
  }

  return valid;
}

// Render tabel
function renderTable(data = todos) {
  tableBody.innerHTML = '';

  if (data.length === 0) {
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  data.forEach(({ id, task, dueDate, status }) => {
    const tr = document.createElement('tr');

    // Task
    const tdTask = document.createElement('td');
    tdTask.textContent = task;

    // Due Date
    const tdDate = document.createElement('td');
    tdDate.textContent = formatDateISOToLocal(dueDate);

    // Status
    const tdStatus = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = badge ${status};
    badge.textContent = status === 'pending' ? 'Pending' : 'Done';
    tdStatus.appendChild(badge);

    // Actions
    const tdActions = document.createElement('td');
    const row = document.createElement('div');
    row.className = 'action-row';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'btn small outline';
    toggleBtn.textContent = status === 'pending' ? 'Mark Done' : 'Mark Pending';
    toggleBtn.addEventListener('click', () => toggleStatus(id));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn small danger';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteTodo(id));

    row.appendChild(toggleBtn);
    row.appendChild(deleteBtn);
    tdActions.appendChild(row);

    tr.appendChild(tdTask);
    tr.appendChild(tdDate);
    tr.appendChild(tdStatus);
    tr.appendChild(tdActions);

    tableBody.appendChild(tr);
  });
}

// Tambah todo
function addTodo(task, dueDate) {
  const newTodo = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    task,
    dueDate, // 'YYYY-MM-DD'
    status: 'pending'
  };
  todos.push(newTodo);
  persist();
  renderTable();
}

// Toggle status
function toggleStatus(id) {
  todos = todos.map(t => t.id === id ? { ...t, status: t.status === 'pending' ? 'done' : 'pending' } : t);
  persist();
  applyFilter(); // agar view konsisten dgn filter aktif
}

// Delete todo
function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  persist();
  applyFilter();
}

// Filter
function applyFilter() {
  const statusVal = statusFilter.value; // all | pending | done
  const dateVal = dateFilter.value;     // '' | 'YYYY-MM-DD'

  let result = [...todos];
  if (statusVal !== 'all') {
    result = result.filter(t => t.status === statusVal);
  }
  if (dateVal) {
    result = result.filter(t => t.dueDate === dateVal);
  }
  renderTable(result);
}

function clearFilter() {
  statusFilter.value = 'all';
  dateFilter.value = '';
  renderTable();
}

// Persist ke localStorage agar tidak hilang saat refresh
function persist() {
  localStorage.setItem('sefc_todos', JSON.stringify(todos));
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem('sefc_todos');
    todos = raw ? JSON.parse(raw) : [];
  } catch (e) {
    todos = [];
  }
}

// Event listeners
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const taskVal = taskInput.value.trim();
  const dateVal = dateInput.value;

  addTodo(taskVal, dateVal);
  form.reset();
});

resetFormBtn.addEventListener('click', () => {
  taskError.textContent = '';
  dateError.textContent = '';
});

applyFilterBtn.addEventListener('click', applyFilter);
clearFilterBtn.addEventListener('click', clearFilter);

// Init
loadFromStorage();
renderTable();