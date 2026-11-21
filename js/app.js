// ==================== taskManager.js ====================
class TaskManager {
  constructor(currentId = 0) {
    this.tasks = [];
    this.currentId = currentId;
  }

  // Registra una nueva tarea con un id consecutivo y estado inicial PORHACER
  addTask(name, description, dueDate, status) {
    this.currentId++;

    const task = {
      id: this.currentId,
      name: name,
      description: description,
      dueDate: dueDate,
      status: 'PORHACER'
    };

    this.tasks.push(task);
    return task; // devolvemos la tarea para poder usar su id al dibujarla
  }
}

// ==================== index.js ====================
// Las 5 tareas de ejemplo del HTML ya usan los ids 1 a 5, por eso empezamos en 5
const taskManager = new TaskManager(5);
console.log(taskManager.tasks);

// Seleccionamos los elementos del HTML por su id
const taskForm = document.querySelector('#taskForm');
const formAlert = document.querySelector('#formAlert');

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

// Se ejecuta cuando el usuario envía el formulario
taskForm.addEventListener('submit', function (event) {
  event.preventDefault(); // evita que la página se recargue

  // Recuperamos lo que escribió el usuario
  const newTaskNameInput = document.querySelector('#newTaskNameInput');
  const newTaskDescriptionInput = document.querySelector('#newTaskDescriptionInput');
  const newTaskDateInput = document.querySelector('#newTaskDateInput');
  const newTaskStatusInput = document.querySelector('#newTaskStatusInput');

  const data = {
    name: newTaskNameInput.value,
    description: newTaskDescriptionInput.value,
    date: newTaskDateInput.value,
    status: newTaskStatusInput.value
  };

  // Comprobamos en la consola que los datos se leen bien
  console.log('name: ' + data.name);
  console.log('description: ' + data.description);
  console.log('date: ' + data.date);
  console.log('status: ' + data.status);

  const errors = validFormFieldInput(data);

  if (errors.length > 0) {
    // Hay errores: mostramos la alerta
    formAlert.innerHTML = errors.join('<br>');
    formAlert.classList.remove('d-none');
  } else {
    // Todo correcto: ocultamos la alerta
    formAlert.classList.add('d-none');
    console.log('Formulario válido');
    createTask(data); // registra en TaskManager y crea la tarjeta
  }
});

// ===== Parte 2: marcar / desmarcar tareas como completadas =====
const taskCards = document.querySelector('#taskCards');

// Un solo "oyente" para todas las tarjetas (también las que se creen después)
taskCards.addEventListener('click', function (event) {
  const button = event.target.closest('.btn-toggle-task');
  if (!button) {
    return;
  }

  const card = button.closest('.card');
  const badge = card.querySelector('.badge');

  // toggle: si la clase está la quita, si no está la agrega
  const isCompleted = card.classList.toggle('tarea-completada');

  if (isCompleted) {
    badge.className = 'badge text-bg-success';
    badge.textContent = 'Completada';
    button.textContent = 'Marcar como pendiente';
  } else {
    badge.className = 'badge text-bg-secondary';
    badge.textContent = 'Pendiente';
    button.textContent = 'Marcar como realizada';
  }

  updateCounters();
});


// ===== Lista general: seleccionar, eliminar y mostrar formulario =====
const taskList = document.querySelector('#taskList');
const btnAgregar = document.querySelector('#btnAgregar');
const btnEliminar = document.querySelector('#btnEliminar');
const formSection = document.querySelector('#formSection');

// Clic sobre una tarea de la lista: la selecciona o la deselecciona
taskList.addEventListener('click', function (event) {
  const item = event.target.closest('li');
  if (item) {
    item.classList.toggle('seleccionada');
  }
});

// Botón Eliminar: borra las tareas seleccionadas (de la lista y su tarjeta)
btnEliminar.addEventListener('click', function () {
  const selected = taskList.querySelectorAll('li.seleccionada');

  selected.forEach(function (item) {
    const card = document.querySelector('.col[data-id="' + item.dataset.id + '"]');
    if (card) {
      card.remove();
    }
    item.remove();
  });

  updateCounters();
});

// Botón Agregar: muestra u oculta el formulario
btnAgregar.addEventListener('click', function () {
  formSection.classList.toggle('d-none');
});


// ===== Crear una tarea nueva desde el formulario =====
// Convierte 2026-11-10 en 10/11/2026
function formatDate(isoDate) {
  const parts = isoDate.split('-');
  return parts[2] + '/' + parts[1] + '/' + parts[0];
}

function createTask(data) {
  // Guardamos la tarea en el TaskManager (él asigna el id)
  const saved = taskManager.addTask(
    data.name.trim(),
    data.description.trim(),
    data.date,
    data.status
  );
  console.log(taskManager.tasks);

  const id = saved.id;
  // Para dibujar la tarjeta usamos el estado que eligió el usuario en el formulario
  const task = {
    id: id,
    name: saved.name,
    description: saved.description,
    date: saved.dueDate,
    status: data.status
  };
  const isCompleted = task.status === 'Completada';

  // Colores del badge según el estado
  const badgeClasses = {
    'Pendiente': 'text-bg-secondary',
    'En progreso': 'text-bg-warning',
    'Completada': 'text-bg-success'
  };

  // 1) Tarjeta en el panel "Tareas"
  const col = document.createElement('div');
  col.className = 'col';
  col.dataset.id = id;
  col.dataset.date = task.date;
  col.innerHTML =
    '<div class="card tarjeta-lcd">' +
      '<div class="card-body">' +
        '<h5 class="card-title"></h5>' +
        '<p class="card-text mb-2"></p>' +
        '<span class="badge"></span>' +
      '</div>' +
      '<div class="card-footer">' +
        '<small></small>' +
        '<button type="button" class="btn btn-lcd btn-sm w-100 mt-2 btn-toggle-task"></button>' +
      '</div>' +
    '</div>';

  // El texto se agrega con textContent (más seguro que innerHTML)
  col.querySelector('.card-title').textContent = task.name;
  col.querySelector('.card-text').textContent = task.description;
  col.querySelector('small').textContent = 'Fecha de entrega: ' + formatDate(task.date);

  const badge = col.querySelector('.badge');
  badge.classList.add(badgeClasses[task.status]);
  badge.textContent = task.status;

  const button = col.querySelector('.btn-toggle-task');
  button.textContent = isCompleted ? 'Marcar como pendiente' : 'Marcar como realizada';

  if (isCompleted) {
    col.querySelector('.card').classList.add('tarea-completada');
  }

  taskCards.appendChild(col);
  col.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // 2) Elemento en el "Listado de tareas General"
  const item = document.createElement('li');
  item.dataset.id = id;
  item.textContent = task.name;
  taskList.appendChild(item);

  // 3) Limpiamos el formulario y lo ocultamos
  taskForm.reset();
  formSection.classList.add('d-none');

  updateCounters();
}


// ===== Contadores del resumen =====
// La "fecha de hoy" se toma de la fecha que muestra el reloj (dd/mm/aaaa)
function getToday() {
  const parts = document.querySelector('#relojFecha').textContent.trim().split('/');
  return parts[2] + '-' + parts[1] + '-' + parts[0]; // aaaa-mm-dd
}

function updateCounters() {
  const today = getToday();
  let pending = 0;
  let dueToday = 0;
  let overdue = 0;
  let completed = 0;

  taskCards.querySelectorAll('.col').forEach(function (col) {
    const isCompleted = col.querySelector('.card').classList.contains('tarea-completada');

    // Tachamos en la lista general las tareas completadas
    const item = taskList.querySelector('li[data-id="' + col.dataset.id + '"]');
    if (item) {
      item.classList.toggle('completada', isCompleted);
    }

    if (isCompleted) {
      completed++;
    } else {
      pending++;
      if (col.dataset.date === today) {
        dueToday++;
      } else if (col.dataset.date < today) {
        overdue++;
      }
    }
  });

  document.querySelector('#contPorHacer').textContent = pending;
  document.querySelector('#contDelDia').textContent = dueToday;
  document.querySelector('#contVencidas').textContent = overdue;
  document.querySelector('#contCompletadas').textContent = completed;
}

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
    updateCounters();
  }
}

updateClock();
setInterval(updateClock, 1000);

// Calculamos los contadores al cargar la página
updateCounters();
