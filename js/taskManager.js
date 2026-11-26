// ==================== taskManager.js ====================
// Colores del badge según el estado
const BADGE_CLASSES = {
  'Pendiente': 'text-bg-secondary',
  'En progreso': 'text-bg-warning',
  'Completada': 'text-bg-success'
};

// Evita que el texto del usuario se interprete como HTML
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Convierte 2026-11-10 en 10/11/2026
function formatDate(isoDate) {
  const parts = isoDate.split('-');
  return parts[2] + '/' + parts[1] + '/' + parts[0];
}

// Devuelve el HTML de la tarjeta de una tarea (incluye el botón Eliminar)
function createTaskHtml(task) {
  const isCompleted = task.status === 'Completada';

  return (
    '<div class="col" data-task-id="' + task.id + '">' +
      '<div class="card tarjeta-lcd' + (isCompleted ? ' tarea-completada' : '') + '">' +
        '<div class="card-body">' +
          '<h5 class="card-title">' + escapeHtml(task.name) + '</h5>' +
          '<p class="card-text mb-2">' + escapeHtml(task.description) + '</p>' +
          '<span class="badge ' + (BADGE_CLASSES[task.status] || 'text-bg-secondary') + '">' +
            escapeHtml(task.status) +
          '</span>' +
        '</div>' +
        '<div class="card-footer">' +
          '<small>Fecha de entrega: ' + escapeHtml(formatDate(task.dueDate)) + '</small>' +
          '<div class="d-flex gap-2 mt-2">' +
            '<button type="button" class="btn btn-lcd btn-sm flex-fill btn-toggle-task">' +
              (isCompleted ? 'Marcar como pendiente' : 'Marcar como realizada') +
            '</button>' +
            '<button type="button" class="btn btn-lcd btn-sm flex-fill delete-button">Eliminar</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
}

class TaskManager {
  constructor(currentId = 0) {
    this.tasks = [];
    this.currentId = currentId;
    this.selectedIds = new Set(); // tareas abiertas en el panel derecho (no se guardan)
  }

  // Registra una nueva tarea con un id consecutivo
  addTask(name, description, dueDate, status) {
    this.currentId++;

    const task = {
      id: this.currentId,
      name: name,
      description: description,
      dueDate: dueDate,
      status: status
    };

    this.tasks.push(task);
    return task;
  }

  // Busca una tarea por su id (o devuelve undefined)
  getTaskById(taskId) {
    for (let task of this.tasks) {
      if (task.id === taskId) {
        return task;
      }
    }
    return undefined;
  }

  // Alterna una tarea entre Completada y Pendiente
  toggleTask(taskId) {
    const task = this.getTaskById(taskId);
    if (task) {
      task.status = task.status === 'Completada' ? 'Pendiente' : 'Completada';
    }
  }

  // Elimina la tarea con ese id: conserva solo las que tienen un id diferente
  deleteTask(taskId) {
    const newTasks = [];

    for (let task of this.tasks) {
      if (task.id !== taskId) {
        newTasks.push(task);
      }
    }

    this.tasks = newTasks;
    this.selectedIds.delete(taskId); // si estaba abierta en el panel, se cierra
  }

  // Guarda las tareas en localStorage
  save() {
    try {
      localStorage.setItem('tasks', JSON.stringify(this.tasks));
      localStorage.setItem('currentId', String(this.currentId));
    } catch (error) {
      console.error('No se pudo guardar en localStorage:', error);
    }
  }

  // Carga las tareas guardadas (si las hay)
  load() {
    try {
      const stored = JSON.parse(localStorage.getItem('tasks'));
      if (Array.isArray(stored)) {
        this.tasks = stored;
      }

      // currentId nunca debe quedar por debajo del id más alto, para no repetir ids
      let maxId = Number(localStorage.getItem('currentId')) || 0;
      for (let task of this.tasks) {
        if (task.id > maxId) {
          maxId = task.id;
        }
      }
      this.currentId = maxId;
    } catch (error) {
      console.error('No se pudo leer localStorage:', error);
      this.tasks = [];
    }
  }

  // Dibuja el listado general, las tarjetas seleccionadas y los contadores
  render() {
    const taskList = document.querySelector('#taskList');
    const taskCards = document.querySelector('#taskCards');
    const emptyMsg = document.querySelector('#panelVacio');

    taskList.innerHTML = '';
    let cardsHtml = '';

    for (let task of this.tasks) {
      const selected = this.selectedIds.has(task.id);

      // Elemento del "Listado de tareas General"
      const item = document.createElement('li');
      item.dataset.taskId = task.id;
      item.textContent = task.name;
      item.classList.toggle('seleccionada', selected);
      item.classList.toggle('completada', task.status === 'Completada');
      taskList.appendChild(item);

      // Tarjeta del panel "Tareas" (solo las seleccionadas)
      if (selected) {
        cardsHtml += createTaskHtml(task);
      }
    }

    taskCards.innerHTML = cardsHtml;
    emptyMsg.classList.toggle('d-none', this.selectedIds.size > 0);

    this.updateCounters();
  }

  // Recalcula el resumen (por hacer, del día, vencidas, completadas)
  updateCounters() {
    const today = getToday();
    let pending = 0;
    let dueToday = 0;
    let overdue = 0;
    let completed = 0;

    for (let task of this.tasks) {
      if (task.status === 'Completada') {
        completed++;
      } else {
        pending++;
        if (task.dueDate === today) {
          dueToday++;
        } else if (task.dueDate < today) {
          overdue++;
        }
      }
    }

    document.querySelector('#contPorHacer').textContent = pending;
    document.querySelector('#contDelDia').textContent = dueToday;
    document.querySelector('#contVencidas').textContent = overdue;
    document.querySelector('#contCompletadas').textContent = completed;
  }
}

// La "fecha de hoy" se toma de la fecha que muestra el reloj (dd/mm/aaaa)
function getToday() {
  const parts = document.querySelector('#relojFecha').textContent.trim().split('/');
  return parts[2] + '-' + parts[1] + '-' + parts[0]; // aaaa-mm-dd
}
