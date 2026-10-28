const STORAGE_KEY = 'taskflow.tasks.v1';
const taskList = document.querySelector('#task-list');
const dialog = document.querySelector('#task-dialog');
const form = document.querySelector('#task-form');
const today = new Date();
let tasks = loadTasks();
let activeFilter = 'all';
let calendarDate = new Date(today.getFullYear(), today.getMonth(), 1);
let toastTimer;

function loadTasks() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}
function saveTasks() { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
function dateOnly(value) { return new Date(`${value}T00:00:00`); }
function formatDate(value, options = { day: 'numeric', month: 'short' }) {
  return dateOnly(value).toLocaleDateString('es-CO', options);
}
function escapeHtml(value = '') {
  return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
function notify(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}
function isUpcoming(task) {
  const remaining = (dateOnly(task.date) - dateOnly(today.toISOString().slice(0, 10))) / 86400000;
  return !task.done && remaining >= 0 && remaining <= 3;
}
function renderTasks() {
  const visible = tasks.filter(task => activeFilter === 'all' || (activeFilter === 'done' ? task.done : !task.done))
    .sort((a, b) => a.date.localeCompare(b.date));
  document.querySelector('#total-count').textContent = tasks.length;
  document.querySelector('#done-count').textContent = tasks.filter(task => task.done).length;
  document.querySelector('#due-count').textContent = tasks.filter(isUpcoming).length;
  taskList.innerHTML = visible.length ? visible.map(task => `
    <article class="task-item ${task.done ? 'completed' : ''}">
      <input class="task-check" type="checkbox" aria-label="Marcar ${escapeHtml(task.title)} como realizada" data-toggle="${task.id}" ${task.done ? 'checked' : ''} />
      <div class="task-main"><div class="task-title">${escapeHtml(task.title)} ${isUpcoming(task) ? '<span title="Próxima a vencer">🔔</span>' : ''}</div>
      ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
      <div class="task-meta"><time class="task-date">${formatDate(task.date)}</time><span class="priority ${escapeHtml(task.priority)}">${escapeHtml(task.priority)}</span>${task.done ? '<span class="priority Baja">Realizada</span>' : ''}</div></div>
      <button class="delete-task" data-delete="${task.id}" aria-label="Eliminar tarea">×</button>
    </article>`).join('') : '<div class="empty-state"><span>✦</span>No hay tareas para mostrar.<br>Agrega una nueva y organiza tu día.</div>';
  renderCalendar();
  renderDueList();
}
function renderCalendar() {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  document.querySelector('#calendar-title').textContent = calendarDate.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  const weekdays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const taskDays = new Set(tasks.map(task => task.date));
  const cells = weekdays.map(day => `<div class="calendar-day-label">${day}</div>`);
  for (let i = 0; i < offset; i++) cells.push('<div class="calendar-day empty"></div>');
  for (let day = 1; day <= count; day++) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday = key === today.toISOString().slice(0, 10);
    cells.push(`<div class="calendar-day ${isToday ? 'today' : ''} ${taskDays.has(key) ? 'has-task' : ''}" title="${taskDays.has(key) ? 'Hay tareas este día' : ''}">${day}</div>`);
  }
  document.querySelector('#calendar-grid').innerHTML = cells.join('');
}
function renderDueList() {
  const dueTasks = tasks.filter(task => !task.done && dateOnly(task.date) >= dateOnly(today.toISOString().slice(0, 10)))
    .sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
  document.querySelector('#due-list').innerHTML = dueTasks.length ? dueTasks.map(task =>
    `<div class="due-item"><span>${escapeHtml(task.title)}</span><time>${formatDate(task.date)}</time></div>`).join('')
    : '<p class="no-due">No tienes vencimientos próximos. ¡Buen trabajo!</p>';
}

document.querySelector('#today-label').textContent = today.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' });
document.querySelector('#task-date').min = today.toISOString().slice(0, 10);
document.querySelector('#new-task-button').addEventListener('click', () => dialog.showModal());
document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
document.querySelector('#cancel-dialog').addEventListener('click', () => dialog.close());
document.querySelector('#prev-month').addEventListener('click', () => { calendarDate.setMonth(calendarDate.getMonth() - 1); renderCalendar(); });
document.querySelector('#next-month').addEventListener('click', () => { calendarDate.setMonth(calendarDate.getMonth() + 1); renderCalendar(); });
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  document.querySelectorAll('.filter').forEach(item => item.classList.toggle('active', item === button));
  renderTasks();
}));
form.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(form);
  tasks.push({ id: crypto.randomUUID(), title: data.get('title').trim(), description: data.get('description').trim(), date: data.get('date'), priority: data.get('priority'), done: false });
  saveTasks(); renderTasks(); form.reset(); document.querySelector('#task-date').min = today.toISOString().slice(0, 10); dialog.close(); notify('Tarea guardada correctamente');
});
taskList.addEventListener('change', event => {
  const id = event.target.dataset.toggle;
  if (!id) return;
  const task = tasks.find(item => item.id === id);
  task.done = event.target.checked;
  saveTasks(); renderTasks(); notify(task.done ? '¡Tarea completada!' : 'Tarea marcada como pendiente');
});
taskList.addEventListener('click', event => {
  const id = event.target.dataset.delete;
  if (!id) return;
  tasks = tasks.filter(task => task.id !== id);
  saveTasks(); renderTasks(); notify('Tarea eliminada');
});
renderTasks();
