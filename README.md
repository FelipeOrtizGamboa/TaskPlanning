<div align="center">

# 🕹️ TaskPlanning

### Tu planificador de tareas con alma de consola retro

*Organiza tus pendientes en una pantalla LCD verde... y cuando necesites un descanso, hay un dinosaurio esperándote.* 🦖

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Bootstrap](https://img.shields.io/badge/Bootstrap_5-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)

</div>

<!-- Cuando tengas una captura, guárdala en una carpeta img/ y descomenta esta línea:
<p align="center"><img src="img/captura.png" alt="Captura de TaskPlanning" width="800"></p>
-->

---

## 🎮 ¿De qué se trata?

**TaskPlanning** es una aplicación web que imita un dispositivo de bolsillo de los noventa: carcasa azul, pantallas verdes tipo LCD y tipografía digital. Detrás del look retro hay un planificador real: registras tareas, las consultas, las marcas como hechas y ves de un vistazo cuántas tienes pendientes, para hoy o vencidas.

Fue construido como proyecto individual del programa de formación en desarrollo full stack, usando solo **HTML, CSS y JavaScript** (más Bootstrap para la grilla).

---

## ✨ Funcionalidades

| | Qué hace |
|---|---|
| 📊 **Resumen en vivo** | Contadores de tareas *por hacer*, *del día*, *vencidas* y *completadas*, que se recalculan solos. |
| 📋 **Listado general** | Lista numerada de todas tus tareas. Haz clic en una para seleccionarla (o varias a la vez). |
| 🪟 **Panel de detalle** | Al seleccionar una tarea, su tarjeta se abre en el panel de la derecha con descripción, fecha de entrega y estado. |
| ➕ **Formulario con validación** | Nombre, descripción, fecha y estado. Si falta algo, te avisa exactamente qué. |
| ✅ **Marcar como realizada** | Cada tarjeta tiene su botón; las completadas se tachan y cambian de color. |
| 🗑️ **Eliminar** | Borra las tareas seleccionadas de la lista y del panel. |
| 🕒 **Reloj de Colombia** | Hora, día y fecha en zona horaria `America/Bogota`, actualizados cada segundo. |
| 🦖 **Juego del dinosaurio** | Un runner dibujado en `<canvas>` con cactus, pájaros, velocidad creciente y récord (HI). |

---

## 🚀 Cómo ejecutarlo

No necesitas instalar nada.

```bash
# 1. Clona el repositorio
git clone https://github.com/FelipeOrtizGamboa/TaskPlanning.git

# 2. Entra a la carpeta
cd TaskPlanning

# 3. Abre index.html en tu navegador (doble clic, o con Live Server en VS Code)
```

> 💡 Se necesita conexión a internet solo para cargar Bootstrap y la fuente *Orbitron* desde su CDN.

---

## 🧭 Guía rápida

1. **Agrega una tarea:** pulsa **Agregar**, llena el formulario y envíalo. La tarea aparece en la lista y se abre sola en el panel.
2. **Consulta una tarea:** haz clic sobre su nombre en el listado para ver su tarjeta a la derecha.
3. **Complétala:** usa **Marcar como realizada** en su tarjeta y mira cómo cambian los contadores.
4. **Limpia la lista:** selecciona una o varias tareas y pulsa **Eliminar**.
5. **Tómate un descanso:** presiona <kbd>Espacio</kbd> y deja que el dino corra.

### 🦖 Controles del juego

| Acción | Teclado | Celular |
|---|---|---|
| Empezar / saltar | <kbd>Espacio</kbd> o <kbd>↑</kbd> | Tocar el juego |
| Agacharse | <kbd>↓</kbd> | — |
| Reiniciar tras perder | <kbd>Espacio</kbd> | Tocar el juego |

El juego se pausa solo cuando sales de él; <kbd>Espacio</kbd> lo reanuda.

---

## 🧱 Estructura del proyecto

```text
TaskPlanning/
├── index.html                  # Estructura de la interfaz
├── css/
│   └── styles.css              # Carcasa azul, pantallas LCD y tarjetas
├── js/
│   ├── app.js                  # TaskManager, formulario, lista, tarjetas, contadores y reloj
│   └── dino.js                 # Juego del dinosaurio en <canvas>
├── Borrador del diseño.jpg     # Boceto original de la interfaz
└── README.md
```

---

## 🧠 Un vistazo al código

- **`TaskManager`**: clase que guarda las tareas y asigna un `id` consecutivo con `addTask()`.
- **Delegación de eventos**: un solo *listener* para la lista y otro para las tarjetas, que también funcionan con las tareas creadas después.
- **Validación**: `validFormFieldInput()` revisa los campos y devuelve la lista de errores que se muestra en la alerta.
- **Fechas**: los contadores comparan la fecha de cada tarea con la del reloj para saber qué vence hoy y qué ya venció.
- **Dino**: bucle con `requestAnimationFrame`, colisiones por rectángulos y sprites dibujados píxel a píxel desde texto.

---

## 🗺️ Próximos pasos

- [ ] Guardar las tareas en `localStorage` para que no se pierdan al recargar.
- [ ] Editar una tarea existente.
- [ ] Filtrar por estado (pendientes, en progreso, completadas).
- [ ] Ordenar por fecha de entrega.

---

## 🎨 Diseño

El diseño de la interfaz fue planeado en Figma: [ver prototipo](https://www.figma.com/design/3b0hi5I2xXEDodH2LTwtvL/Taskdesk?node-id=0-1&t=4FPY6IxHSOuS7OKI-1).

---

<div align="center">

**Un paso a la vez. Cada tarea cuenta.** ✦

Hecho con ☕ y mucho `console.log()` por [Felipe Ortiz Gamboa](https://github.com/FelipeOrtizGamboa)

</div>
