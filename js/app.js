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
  }
});