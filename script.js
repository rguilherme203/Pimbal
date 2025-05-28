const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartBtn = document.getElementById('restartBtn');
const scoreDiv = document.getElementById('score');

// Mobile controls
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const bothBtn = document.getElementById('bothBtn');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Ball
let ball, ballSpeed, ballRadius;

// Flippers
let leftFlipper, rightFlipper, flipperLength, flipperWidth, flipperAngle, flipperMaxAngle, flipperMinAngle, flipperSpeed;

// Obstacles
let obstacles;

// Score
let score;

// Game state
let running = true;

// Controls
let leftPressed = false;
let rightPressed = false;

function resetGame() {
  // Ball
  ballRadius = 14;
  ball = { x: WIDTH / 2, y: HEIGHT - 120, vx: 4, vy: -8 };
  ballSpeed = 8;

  // Flippers
  flipperLength = 100;
  flipperWidth = 18;
  flipperAngle = 30 * Math.PI / 180;
  flipperMaxAngle = 60 * Math.PI / 180;
  flipperMinAngle = 20 * Math.PI / 180;
  flipperSpeed = 0.15;

  leftFlipper = {
    x: WIDTH / 2 - 80,
    y: HEIGHT - 60,
    angle: -flipperAngle,
    up: false
  };
  rightFlipper = {
    x: WIDTH / 2 + 80,
    y: HEIGHT - 60,
    angle: flipperAngle,
    up: false
  };

  // Obstacles
  obstacles = [
    // Bumpers (aceleram a bola)
    { x: 180, y: 200, r: 30, type: 'bumper' },
    { x: 420, y: 200, r: 30, type: 'bumper' },
    { x: 300, y: 350, r: 30, type: 'bumper' },
    // Labirinto (retarda a bola)
    { x: 120, y: 500, r: 20, type: 'slow' },
    { x: 480, y: 500, r: 20, type: 'slow' },
    // Extra ball (ganha ponto extra)
    { x: 300, y: 120, r: 18, type: 'extra' },
    // Obstáculos normais
    { x: 100, y: 300, r: 18, type: 'normal' },
    { x: 500, y: 300, r: 18, type: 'normal' },
    { x: 200, y: 600, r: 18, type: 'normal' },
    { x: 400, y: 600, r: 18, type: 'normal' }
  ];

  score = 0;
  running = true;
  scoreDiv.textContent = 'Pontuação: 0';
}

function drawTable() {
  ctx.fillStyle = '#181c2f';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.strokeStyle = '#6c63ff';
  ctx.lineWidth = 10;
  ctx.strokeRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = '#222';
  ctx.fillRect(WIDTH / 2 - 60, HEIGHT - 10, 120, 10);
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ballRadius, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.shadowColor = '#6c63ff';
  ctx.shadowBlur = 16;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#6c63ff';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawFlipper(f) {
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.rotate(f.angle);
  ctx.fillStyle = '#6c63ff';
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(-flipperLength / 2, -flipperWidth / 2, flipperLength, flipperWidth, flipperWidth / 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawObstacles() {
  obstacles.forEach(obs => {
    ctx.beginPath();
    ctx.arc(obs.x, obs.y, obs.r, 0, 2 * Math.PI);
    if (obs.type === 'bumper') {
      ctx.fillStyle = '#ffbe76';
    } else if (obs.type === 'slow') {
      ctx.fillStyle = '#22a6b3';
    } else if (obs.type === 'extra') {
      ctx.fillStyle = '#e17055';
    } else {
      ctx.fillStyle = '#636e72';
    }
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (obs.type === 'bumper') ctx.fillText('⚡', obs.x, obs.y);
    if (obs.type === 'slow') ctx.fillText('⏳', obs.x, obs.y);
    if (obs.type === 'extra') ctx.fillText('+1', obs.x, obs.y);
  });
}

function updateBall() {
  if (!running) return;

  ball.x += ball.vx;
  ball.y += ball.vy;
  ball.vy += 0.25;

  if (ball.x - ballRadius < 0) {
    ball.x = ballRadius;
    ball.vx *= -1;
  }
  if (ball.x + ballRadius > WIDTH) {
    ball.x = WIDTH - ballRadius;
    ball.vx *= -1;
  }
  if (ball.y - ballRadius < 0) {
    ball.y = ballRadius;
    ball.vy *= -1;
  }

  obstacles.forEach(obs => {
    const dx = ball.x - obs.x;
    const dy = ball.y - obs.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < ballRadius + obs.r) {
      const angle = Math.atan2(dy, dx);
      const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
      ball.vx = Math.cos(angle) * speed;
      ball.vy = Math.sin(angle) * speed;

      if (obs.type === 'bumper') {
        ball.vx *= 1.2;
        ball.vy *= 1.2;
        score += 50;
      }
      if (obs.type === 'slow') {
        ball.vx *= 0.7;
        ball.vy *= 0.7;
        score += 20;
      }
      if (obs.type === 'extra') {
        score += 100;
        obs.x = -1000;
      }
      if (obs.type === 'normal') {
        score += 10;
      }
      scoreDiv.textContent = 'Pontuação: ' + score;
    }
  });

  [leftFlipper, rightFlipper].forEach(f => {
    const fx1 = f.x + Math.cos(f.angle) * (-flipperLength / 2);
    const fy1 = f.y + Math.sin(f.angle) * (-flipperLength / 2);
    const fx2 = f.x + Math.cos(f.angle) * (flipperLength / 2);
    const fy2 = f.y + Math.sin(f.angle) * (flipperLength / 2);

    const t = ((ball.x - fx1) * (fx2 - fx1) + (ball.y - fy1) * (fy2 - fy1)) /
      ((fx2 - fx1) ** 2 + (fy2 - fy1) ** 2);
    if (t > 0 && t < 1) {
      const closestX = fx1 + (fx2 - fx1) * t;
      const closestY = fy1 + (fy2 - fy1) * t;
      const dist = Math.hypot(ball.x - closestX, ball.y - closestY);
      if (dist < ballRadius + flipperWidth / 2) {
        ball.vy = -Math.abs(ball.vy) - 2 - Math.random() * 2;
        ball.vx += (f === leftFlipper ? -1 : 1) * 2 * Math.random();
        score += 5;
        scoreDiv.textContent = 'Pontuação: ' + score;
      }
    }
  });

  if (ball.y - ballRadius > HEIGHT) {
    running = false;
    scoreDiv.textContent = 'FIM DE JOGO! Pontuação: ' + score;
  }
}

function updateFlippers() {
  // Left
  if (leftPressed && leftFlipper.angle > -flipperMaxAngle) {
    leftFlipper.angle -= flipperSpeed;
  } else if (!leftPressed && leftFlipper.angle < -flipperMinAngle) {
    leftFlipper.angle += flipperSpeed;
  }
  // Right
  if (rightPressed && rightFlipper.angle < flipperMaxAngle) {
    rightFlipper.angle += flipperSpeed;
  } else if (!rightPressed && rightFlipper.angle > flipperMinAngle) {
    rightFlipper.angle -= flipperSpeed;
  }
}

function gameLoop() {
  drawTable();
  drawObstacles();
  drawFlipper(leftFlipper);
  drawFlipper(rightFlipper);
  drawBall();
  updateFlippers();
  updateBall();
  requestAnimationFrame(gameLoop);
}

// Teclado: Direcionais, A/S/D
document.addEventListener('keydown', e => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') leftPressed = true;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') rightPressed = true;
  if (e.code === 'KeyS') { leftPressed = true; rightPressed = true; }
});
document.addEventListener('keyup', e => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') leftPressed = false;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') rightPressed = false;
  if (e.code === 'KeyS') { leftPressed = false; rightPressed = false; }
});

// Botões mobile/touch
leftBtn.addEventListener('touchstart', e => { e.preventDefault(); leftPressed = true; });
leftBtn.addEventListener('touchend', e => { e.preventDefault(); leftPressed = false; });
rightBtn.addEventListener('touchstart', e => { e.preventDefault(); rightPressed = true; });
rightBtn.addEventListener('touchend', e => { e.preventDefault(); rightPressed = false; });
bothBtn.addEventListener('touchstart', e => { e.preventDefault(); leftPressed = true; rightPressed = true; });
bothBtn.addEventListener('touchend', e => { e.preventDefault(); leftPressed = false; rightPressed = false; });

// Também funciona com mouse (para desktop)
leftBtn.addEventListener('mousedown', () => { leftPressed = true; });
leftBtn.addEventListener('mouseup', () => { leftPressed = false; });
rightBtn.addEventListener('mousedown', () => { rightPressed = true; });
rightBtn.addEventListener('mouseup', () => { rightPressed = false; });
bothBtn.addEventListener('mousedown', () => { leftPressed = true; rightPressed = true; });
bothBtn.addEventListener('mouseup', () => { leftPressed = false; rightPressed = false; });

restartBtn.addEventListener('click', () => {
  resetGame();
});

resetGame();
gameLoop();
