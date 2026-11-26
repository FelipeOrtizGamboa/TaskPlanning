// ==================== index.js ====================
const taskManager = new TaskManager();

// Seleccionamos los elementos del HTML por su id
const taskForm = document.querySelector('#taskForm');
const formAlert = document.querySelector('#formAlert');
const taskCards = document.querySelector('#taskCards');
const taskList = document.querySelector('#taskList');
const btnAgregar = document.querySelector('#btnAgregar');
const btnEliminar = document.querySelector('#btnEliminar');
const formSection = document.querySelector('#formSection');

// Revisa los datos y devuelve una lista de errores (vacía si todo está bien)
function validFormFieldInput(data) {
  const errors = [];

  if (data.name.trim() === '') {
    errors.push('El nombre no puede estar vacío.');
  }
  if (data.description.trim() === '') {
    errors.push('La descripción no puede estar vacía.');
  }
  if (data.date === '') {
    errors.push('Debes seleccionar una fecha de entrega.');
  }
  if (data.status === '') {
    errors.push('Debes seleccionar un estado.');
  }

  return errors;
}

// ===== Formulario: crear una tarea nueva =====
taskForm.addEventListener('submit', function (event) {
  event.preventDefault(); // evita que la página se recargue

  const data = {
    name: document.querySelector('#newTaskNameInput').value,
    description: document.querySelector('#newTaskDescriptionInput').value,
    date: document.querySelector('#newTaskDateInput').value,
    status: document.querySelector('#newTaskStatusInput').value
  };

  const errors = validFormFieldInput(data);

  if (errors.length > 0) {
    formAlert.innerHTML = errors.join('<br>');
    formAlert.classList.remove('d-none');
    return;
  }

  formAlert.classList.add('d-none');

  const saved = taskManager.addTask(
    data.name.trim(),
    data.description.trim(),
    data.date,
    data.status
  );

  taskManager.selectedIds.add(saved.id); // la tarea nueva se abre en el panel
  taskManager.save();
  taskManager.render();

  taskForm.reset();
  formSection.classList.add('d-none');

  const newCard = taskCards.querySelector('[data-task-id="' + saved.id + '"]');
  if (newCard) {
    newCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});

// ===== Tarjetas: marcar como realizada y eliminar =====
// Un solo "oyente" para todas las tarjetas (también las que se creen después)
taskCards.addEventListener('click', function (event) {
  // La tarjeta (col) es el elemento que tiene el atributo data-task-id
  const parentTask = event.target.closest('[data-task-id]');
  if (!parentTask) {
    return;
  }
  const taskId = Number(parentTask.dataset.taskId); // el data-* llega como texto

  if (event.target.closest('.btn-toggle-task')) {
    taskManager.toggleTask(taskId);
    taskManager.save();
    taskManager.render();
  }

  if (event.target.classList.contains('delete-button')) {
    taskManager.deleteTask(taskId);
    taskManager.save();
    taskManager.render();
  }
});

// ===== Lista general: seleccionar tareas =====
taskList.addEventListener('click', function (event) {
  const item = event.target.closest('li');
  if (!item) {
    return;
  }

  const taskId = Number(item.dataset.taskId);
  if (taskManager.selectedIds.has(taskId)) {
    taskManager.selectedIds.delete(taskId);
  } else {
    taskManager.selectedIds.add(taskId);
  }
  taskManager.render();
});

// Botón Eliminar (general): borra todas las tareas seleccionadas
btnEliminar.addEventListener('click', function () {
  const idsToDelete = Array.from(taskManager.selectedIds);

  for (let taskId of idsToDelete) {
    taskManager.deleteTask(taskId);
  }

  taskManager.save();
  taskManager.render();
});

// Botón Agregar: muestra u oculta el formulario
btnAgregar.addEventListener('click', function () {
  formSection.classList.toggle('d-none');
});

// ===== Reloj y fecha con la hora de Colombia =====
const relojDia = document.querySelector('#relojDia');
const relojFecha = document.querySelector('#relojFecha');
const relojHora = document.querySelector('#relojHora');
const relojAmPm = document.querySelector('#relojAmPm');

// Colombia está en la zona "America/Bogota" (UTC-5, sin horario de verano)
const clockFormat = new Intl.DateTimeFormat('es-CO', {
  timeZone: 'America/Bogota',
  weekday: 'long',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true
});

function updateClock() {
  const parts = clockFormat.formatToParts(new Date());
  const get = function (type) {
    return parts.find(function (p) { return p.type === type; }).value;
  };

  const date = get('day') + '/' + get('month') + '/' + get('year');
  // "a. m." / "p. m." -> "A.M." / "P.M."
  const isAm = get('dayPeriod').replace(/[\s.\u00a0\u202f]/g, '').toLowerCase() === 'am';

  relojDia.textContent = get('weekday').toUpperCase();
  relojHora.textContent = get('hour') + ':' + get('minute');
  relojAmPm.textContent = isAm ? 'A.M.' : 'P.M.';

  // Si cambió el día, actualizamos la fecha y recalculamos los contadores
  if (relojFecha.textContent !== date) {
    relojFecha.textContent = date;
    taskManager.updateCounters();
  }
}

updateClock();
setInterval(updateClock, 1000);

// ===== Al cargar la página: recuperar las tareas guardadas y dibujarlas =====
taskManager.load();
taskManager.render();
