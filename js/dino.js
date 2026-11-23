// ==================== dino.js ====================
// Juego del dinosaurio (estilo Chrome) dibujado en un <canvas>.
// Controles: ESPACIO o ↑ para saltar, ↓ para agacharse. En celular: toca el juego para saltar.
(function () {
  const canvas = document.querySelector('#dinoCanvas');
  if (!canvas) {
    return;
  }
  const ctx = canvas.getContext('2d');

  const W = canvas.width;
  const H = canvas.height;
  const GROUND = 180;      // y del suelo
  const INK = '#102510';   // color "tinta" de la pantalla LCD
  const PX = 3;            // tamaño de cada "pixel" del dinosaurio

  const DINO_X = 50;
  const GRAVITY = 2600;    // px/s²
  const JUMP_SPEED = 820;  // px/s
  const START_SPEED = 320; // px/s
  const MAX_SPEED = 720;   // px/s

  // Dibujo del dinosaurio en "pixeles" (# = pintado)
  const DINO_BODY = [
    '........######.',
    '........#.#####',
    '........#######',
    '........#######',
    '........####...',
    '#......#####...',
    '#.....######.#.',
    '##...#######.#.',
    '###.#########..',
    '#############..',
    '.###########...',
    '..##########...',
    '...########....',
    '....#####......'
  ];
  const DINO_LEGS = [
    ['....##...#.....', '....##...##....'],  // pata izquierda abajo
    ['....#....##....', '....##...#.....']   // pata derecha abajo
  ];
  const DINO_W = 15 * PX;
  const DINO_H = (DINO_BODY.length + 2) * PX;
  const DUCK_W = 58;
  const DUCK_H = 27;

  // ---- Estado del juego ----
  let state = 'idle'; // idle | running | paused | over
  let dino, obstacles, speed, distance, nextGap, groundOffset, lastTime, overAt, runTime;
  let hiScore = 0;

  function reset() {
    dino = { y: 0, vy: 0, ducking: false };
    obstacles = [];
    speed = START_SPEED;
    distance = 0;
    nextGap = 500;
    groundOffset = 0;
    runTime = 0;
  }
  reset();

  function getScore() {
    return Math.floor(distance / 10);
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  // ---- Obstáculos ----
  function spawnObstacle() {
    const useBird = getScore() > 200 && Math.random() < 0.3;

    if (useBird) {
      // Pájaro bajo (hay que saltar) o medio (se puede agachar o saltar)
      const lift = Math.random() < 0.5 ? 12 : 30;
      obstacles.push({ type: 'bird', x: W + 20, w: 45, h: 30, lift: lift });
    } else {
      const count = Math.ceil(rand(0, 3)); // 1, 2 o 3 cactus juntos
      obstacles.push({
        type: 'cactus',
        x: W + 20,
        w: count * 24,
        h: Math.round(rand(36, 54)),
        lift: 0,
        count: count
      });
    }
  }

  // ---- Colisiones (rectángulos con un pequeño margen) ----
  function dinoSize() {
    const onGround = dino.y === 0;
    if (dino.ducking && onGround) {
      return { w: DUCK_W, h: DUCK_H };
    }
    return { w: DINO_W, h: DINO_H };
  }

  function hits(o) {
    const size = dinoSize();
    const dLeft = DINO_X + 6;
    const dRight = DINO_X + size.w - 6;
    const dBottom = GROUND - dino.y - 4;
    const dTop = GROUND - dino.y - size.h + 6;

    const oLeft = o.x + 4;
    const oRight = o.x + o.w - 4;
    const oBottom = GROUND - o.lift - 2;
    const oTop = GROUND - o.lift - o.h + 4;

    return dLeft < oRight && dRight > oLeft && dTop < oBottom && dBottom > oTop;
  }

  // ---- Actualización ----
  function update(dt) {
    runTime += dt;
    distance += speed * dt;
    speed = Math.min(MAX_SPEED, START_SPEED + distance * 0.02);
    groundOffset += speed * dt;

    // Salto y gravedad (agacharse en el aire hace caer más rápido)
    if (dino.y > 0 || dino.vy > 0) {
      const g = GRAVITY * (dino.ducking ? 2.2 : 1);
      dino.vy -= g * dt;
      dino.y += dino.vy * dt;
      if (dino.y <= 0) {
        dino.y = 0;
        dino.vy = 0;
      }
    }

    // Obstáculos: mover, generar nuevos y quitar los que ya salieron
    nextGap -= speed * dt;
    if (nextGap <= 0) {
      spawnObstacle();
      nextGap = speed * 0.75 + 200 + rand(0, 350);
    }
    obstacles.forEach(function (o) {
      o.x -= speed * dt;
    });
    obstacles = obstacles.filter(function (o) {
      return o.x + o.w > -20;
    });

    // ¿Chocó?
    for (let i = 0; i < obstacles.length; i++) {
      if (hits(obstacles[i])) {
        hiScore = Math.max(hiScore, getScore());
        overAt = performance.now();
        setState('over');
        return;
      }
    }
  }

  // ---- Dibujo ----
  function drawSprite(rows, x, y, sx, sy) {
    for (let r = 0; r < rows.length; r++) {
      for (let c = 0; c < rows[r].length; c++) {
        if (rows[r][c] === '#') {
          ctx.fillRect(x + c * sx, y + r * sy, sx + 0.5, sy + 0.5);
        }
      }
    }
  }

  function drawDino() {
    const onGround = dino.y === 0;
    const top = GROUND - dino.y - DINO_H;
    // Patas alternadas mientras corre (quieto en el aire o en pausa)
    const frame = state === 'running' && onGround ? Math.floor(runTime * 10) % 2 : 0;
    const rows = DINO_BODY.concat(DINO_LEGS[frame]);

    if (dino.ducking && onGround) {
      // Agachado: el mismo dibujo, más bajo y más largo
      const sx = DUCK_W / 15;
      const sy = DUCK_H / rows.length;
      drawSprite(rows, DINO_X, GROUND - DUCK_H, sx, sy);
    } else {
      drawSprite(rows, DINO_X, top, PX, PX);
    }
  }

  function drawCactus(o) {
    const top = GROUND - o.h;
    for (let i = 0; i < o.count; i++) {
      const x = o.x + i * 24;
      ctx.fillRect(x + 7, top, 10, o.h);                                   // tronco
      ctx.fillRect(x, top + o.h * 0.25, 6, o.h * 0.3);                     // brazo izquierdo
      ctx.fillRect(x, top + o.h * 0.25 + o.h * 0.3 - 6, 10, 6);
      ctx.fillRect(x + 18, top + o.h * 0.35, 6, o.h * 0.25);               // brazo derecho
      ctx.fillRect(x + 14, top + o.h * 0.35 + o.h * 0.25 - 6, 10, 6);
    }
  }

  function drawBird(o) {
    const top = GROUND - o.lift - o.h;
    const wingsUp = Math.floor(runTime * 8) % 2 === 0;
    ctx.fillRect(o.x + 6, top + 14, 33, 10);   // cuerpo
    ctx.fillRect(o.x, top + 12, 10, 6);        // pico
    ctx.fillRect(o.x + 34, top + 16, 11, 4);   // cola
    if (wingsUp) {
      ctx.fillRect(o.x + 16, top + 2, 14, 12); // ala arriba
    } else {
      ctx.fillRect(o.x + 16, top + 24, 14, 6); // ala abajo
    }
  }

  function drawGround() {
    ctx.fillRect(0, GROUND + 1, W, 2);
    // Pequeñas marcas que se mueven para dar sensación de velocidad
    for (let i = 0; i < 24; i++) {
      const base = i * 61 + (i * i) % 17 * 5;
      const x = (((base - groundOffset) % W) + W) % W;
      ctx.fillRect(x, GROUND + 8 + (i % 3) * 5, 6 + (i % 4) * 3, 2);
    }
  }

  function centerText(text, y, size) {
    ctx.font = '700 ' + size + 'px Orbitron, "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(text, W / 2, y);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = INK;

    drawGround();
    obstacles.forEach(function (o) {
      if (o.type === 'cactus') {
        drawCactus(o);
      } else {
        drawBird(o);
      }
    });
    drawDino();

    // Puntaje
    ctx.font = '700 18px Orbitron, "Courier New", monospace';
    ctx.textAlign = 'right';
    const score = String(getScore()).padStart(5, '0');
    const hi = String(hiScore).padStart(5, '0');
    ctx.fillText('HI ' + hi + '   ' + score, W - 16, 30);

    // Mensajes
    if (state === 'idle') {
      centerText('PRESIONA ESPACIO O TOCA PARA JUGAR', 80, 20);
    } else if (state === 'paused') {
      centerText('PAUSA - HAZ CLIC PARA CONTINUAR', 80, 20);
    } else if (state === 'over') {
      centerText('GAME OVER', 75, 28);
      centerText('ESPACIO O TOQUE PARA REINICIAR', 105, 16);
    }
  }

  // ---- Bucle del juego (solo corre mientras se juega) ----
  function frame(now) {
    if (state !== 'running') {
      return;
    }
    const dt = Math.min((now - lastTime) / 1000, 0.05); // máximo 50 ms por cuadro
    lastTime = now;
    update(dt);
    draw();
    if (state === 'running') {
      requestAnimationFrame(frame);
    }
  }

  function setState(next) {
    state = next;
    if (state === 'running') {
      lastTime = performance.now();
      requestAnimationFrame(frame);
    } else {
      draw();
    }
  }

  // ---- Controles ----
  function jump() {
    if (dino.y === 0) {
      dino.vy = JUMP_SPEED;
      dino.y = 0.01;
    }
  }

  function press() {
    if (state === 'idle') {
      reset();
      setState('running');
      jump();
    } else if (state === 'paused') {
      setState('running');
    } else if (state === 'over') {
      if (performance.now() - overAt > 400) { // evita reiniciar sin querer
        reset();
        setState('running');
        jump();
      }
    } else {
      jump();
    }
  }

  // El teclado se escucha en toda la página (no solo en el canvas), así el juego
  // arranca aunque el foco esté en otro lado (lista, botones, etc.).
  // Si el usuario está escribiendo en un campo del formulario, se ignora.
  function isTyping(target) {
    return ['INPUT', 'TEXTAREA', 'SELECT'].indexOf(target.tagName) !== -1;
  }

  document.addEventListener('keydown', function (event) {
    if (isTyping(event.target)) {
      return;
    }
    const gameActive = state !== 'idle' || document.activeElement === canvas;

    if (event.code === 'Space' || (event.code === 'ArrowUp' && gameActive)) {
      event.preventDefault();
      if (event.repeat) {
        return; // mantener la tecla presionada no debe reiniciar el juego
      }
      // Si un botón tenía el foco, lo soltamos para que ESPACIO no lo "clickee"
      if (document.activeElement && document.activeElement.tagName === 'BUTTON') {
        document.activeElement.blur();
      }
      press();
    } else if (event.code === 'ArrowDown' && gameActive) {
      event.preventDefault();
      dino.ducking = true;
    }
  });

  document.addEventListener('keyup', function (event) {
    if (event.code === 'ArrowDown') {
      dino.ducking = false;
    }
  });

  canvas.addEventListener('pointerdown', function () {
    canvas.focus();
    press();
  });

  // Si el usuario sale del juego (por ejemplo para escribir una tarea), se pausa
  canvas.addEventListener('blur', function () {
    dino.ducking = false;
    if (state === 'running') {
      setState('paused');
    }
  });

  draw(); // pantalla inicial
})();
