const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let diver, fishes, jellys, score, oxygen, gameOver, keys, animationId;

function resetGame() {
  diver = {
    x: WIDTH/2,
    y: 80,
    w: 32,
    h: 32,
    vy: 0,
    vx: 0,
    speed: 3,
    color: "#ffe082"
  };
  fishes = [];
  jellys = [];
  score = 0;
  oxygen = 100;
  gameOver = false;
  keys = {};
  spawnFishes();
  spawnJellys();
  document.getElementById('score').textContent = "Peixes: 0";
  document.getElementById('oxygen').textContent = "O2: 100%";
  cancelAnimationFrame(animationId);
  loop();
}

function spawnFishes() {
  fishes = [];
  for (let i = 0; i < 7; i++) {
    fishes.push({
      x: 60 + Math.random()*(WIDTH-120),
      y: 180 + Math.random()*(HEIGHT-260),
      w: 28,
      h: 18,
      vx: (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random()*1.5),
      color: "#4fc3f7"
    });
  }
}

function spawnJellys() {
  jellys = [];
  for (let i = 0; i < 4; i++) {
    jellys.push({
      x: 60 + Math.random()*(WIDTH-120),
      y: 200 + Math.random()*(HEIGHT-300),
      w: 24,
      h: 32,
      vy: 1 + Math.random()*1.5,
      color: "#b39ddb"
    });
  }
}

document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);
document.getElementById('restart-btn').onclick = resetGame;

function drawDiver() {
  ctx.save();
  ctx.translate(diver.x, diver.y);
  // Corpo
  ctx.fillStyle = diver.color;
  ctx.fillRect(-12, -12, 24, 24);
  // Nadadeiras
  ctx.fillStyle = "#039be5";
  ctx.fillRect(-14, 8, 8, 8);
  ctx.fillRect(6, 8, 8, 8);
  // Máscara
  ctx.fillStyle = "#fff";
  ctx.fillRect(-10, -14, 20, 8);
  // Tubo
  ctx.fillStyle = "#00ffe7";
  ctx.fillRect(8, -18, 4, 10);
  ctx.restore();
}

function drawFish(fish) {
  ctx.save();
  ctx.translate(fish.x, fish.y);
  ctx.fillStyle = fish.color;
  ctx.beginPath();
  ctx.ellipse(0, 0, fish.w/2, fish.h/2, 0, 0, Math.PI*2);
  ctx.fill();
  // Cauda
  ctx.beginPath();
  ctx.moveTo(-fish.w/2, 0);
  ctx.lineTo(-fish.w/2-8, -6);
  ctx.lineTo(-fish.w/2-8, 6);
  ctx.closePath();
  ctx.fillStyle = "#0288d1";
  ctx.fill();
  ctx.restore();
}

function drawJelly(jelly) {
  ctx.save();
  ctx.translate(jelly.x, jelly.y);
  ctx.fillStyle = jelly.color;
  ctx.beginPath();
  ctx.ellipse(0, 0, jelly.w/2, jelly.h/2, 0, 0, Math.PI, true);
  ctx.lineTo(jelly.w/2, jelly.h/2);
  ctx.lineTo(-jelly.w/2, jelly.h/2);
  ctx.closePath();
  ctx.fill();
  // Tentáculos
  ctx.strokeStyle = "#fff";
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i*5, jelly.h/2);
    ctx.lineTo(i*5, jelly.h/2+10+Math.sin(Date.now()/300+i)*6);
    ctx.stroke();
  }
  ctx.restore();
}

function drawHUD() {
  document.getElementById('score').textContent = "Peixes: " + score;
  document.getElementById('oxygen').textContent = "O2: " + Math.max(0, Math.floor(oxygen)) + "%";
}

function drawGameOver() {
  ctx.font = "38px Arial";
  ctx.fillStyle = "#ff4081";
  ctx.textAlign = "center";
  ctx.shadowColor = "#000";
  ctx.shadowBlur = 10;
  ctx.fillText("Game Over!", WIDTH/2, HEIGHT/2);
  ctx.font = "22px Arial";
  ctx.fillStyle = "#fff";
  ctx.shadowBlur = 0;
  ctx.fillText("Clique em Reiniciar para jogar de novo.", WIDTH/2, HEIGHT/2 + 40);
}

function update() {
  // Movimento do mergulhador
  if (keys["ArrowLeft"]) diver.x -= diver.speed;
  if (keys["ArrowRight"]) diver.x += diver.speed;
  if (keys["ArrowDown"]) diver.y += diver.speed;
  if (keys["ArrowUp"]) diver.y -= diver.speed;
  if (keys[" "]) diver.y -= diver.speed*1.5; // Subida rápida

  // Limites
  diver.x = Math.max(20, Math.min(WIDTH-20, diver.x));
  diver.y = Math.max(40, Math.min(HEIGHT-20, diver.y));

  // Oxigênio
  if (!gameOver) oxygen -= 0.06;
  if (oxygen <= 0) gameOver = true;

  // Fishes
  for (let fish of fishes) {
    fish.x += fish.vx;
    if (fish.x < 30 || fish.x > WIDTH-30) fish.vx *= -1;
    // Colisão com mergulhador
    if (Math.abs(fish.x-diver.x)<24 && Math.abs(fish.y-diver.y)<24) {
      score++;
      fish.x = 60 + Math.random()*(WIDTH-120);
      fish.y = 180 + Math.random()*(HEIGHT-260);
    }
  }

  // Jellys
  for (let jelly of jellys) {
    jelly.y += jelly.vy;
    if (jelly.y > HEIGHT-40) {
      jelly.y = 120;
      jelly.x = 60 + Math.random()*(WIDTH-120);
    }
    // Colisão com mergulhador
    if (Math.abs(jelly.x-diver.x)<22 && Math.abs(jelly.y-diver.y)<28) {
      oxygen -= 15;
      jelly.y = 120;
      jelly.x = 60 + Math.random()*(WIDTH-120);
    }
  }

  // Voltar à superfície = vitória
  if (diver.y < 60 && score > 0) {
    gameOver = true;
    document.getElementById('score').textContent = "Vitória! Peixes: " + score;
  }
}

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // Fundo do mar
  let grad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  grad.addColorStop(0, "#1e3c72");
  grad.addColorStop(1, "#0b3d91");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Bolhas
  for (let i = 0; i < 20; i++) {
    let bx = (i*37 + Date.now()/30) % WIDTH;
    let by = HEIGHT - ((i*53 + Date.now()/20) % HEIGHT);
    ctx.beginPath();
    ctx.arc(bx, by, 3+Math.sin(i+Date.now()/400)*2, 0, Math.PI*2);
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fill();
  }

  // Peixes
  for (let fish of fishes) drawFish(fish);

  // Águas-vivas
  for (let jelly of jellys) drawJelly(jelly);

  // Mergulhador
  drawDiver();

  // HUD
  drawHUD();

  if (gameOver) drawGameOver();
}

function loop() {
  if (!gameOver) {
    update();
    draw();
    animationId = requestAnimationFrame(loop);
  } else {
    draw();
  }
}

// Iniciar o jogo ao carregar
resetGame();
