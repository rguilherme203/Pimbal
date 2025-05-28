const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let player, platforms, enemies, items, bullets, boss, car, level, lives, item, gameOver, keys, animationId, inCar, bossDefeated;

function resetGame() {
  level = 1;
  lives = 3;
  item = null;
  inCar = false;
  bossDefeated = false;
  startLevel();
}

function startLevel() {
  player = {
    x: 60, y: HEIGHT-80, w: 32, h: 48,
    vx: 0, vy: 0,
    speed: 4, jump: -12, onGround: false,
    color: "#ffe082", dir: 1, canDoubleJump: false, jetpack: false
  };
  platforms = [
    {x: 0, y: HEIGHT-32, w: WIDTH, h: 32},
    {x: 120, y: HEIGHT-120, w: 120, h: 16},
    {x: 320, y: HEIGHT-200, w: 100, h: 16},
    {x: 500, y: HEIGHT-280, w: 120, h: 16},
    {x: 700, y: HEIGHT-360, w: 80, h: 16},
    {x: 600, y: HEIGHT-80, w: 120, h: 16}
  ];
  enemies = [
    {x: 350, y: HEIGHT-248, w: 32, h: 32, vx: 2, hp: 2, alive: true},
    {x: 720, y: HEIGHT-392, w: 32, h: 32, vx: -2, hp: 2, alive: true}
  ];
  items = [
    {x: 330, y: HEIGHT-232, type: "jetpack", taken: false},
    {x: 520, y: HEIGHT-312, type: "life", taken: false},
    {x: 750, y: HEIGHT-392, type: "car", taken: false}
  ];
  bullets = [];
  car = {x: 750, y: HEIGHT-392, w: 48, h: 24, taken: false};
  boss = {x: WIDTH-100, y: HEIGHT-112, w: 48, h: 64, hp: 8+level*2, alive: true};
  gameOver = false;
  updateHUD();
  cancelAnimationFrame(animationId);
  loop();
}

function updateHUD() {
  document.getElementById('lives').textContent = "Vidas: " + lives;
  document.getElementById('level').textContent = "Nível: " + level;
  document.getElementById('item').textContent = "Item: " + (item ? item : "Nenhum");
}

document.addEventListener('keydown', e => {
  keys = keys || {};
  keys[e.key] = true;
  // Pular
  if ((e.key === 'a' || e.key === 'A') && player.onGround) {
    player.vy = player.jump;
    player.onGround = false;
    player.canDoubleJump = true;
  } else if ((e.key === 'a' || e.key === 'A') && player.canDoubleJump && (item === "jetpack" || player.jetpack)) {
    player.vy = player.jump;
    player.canDoubleJump = false;
  }
  // Atirar
  if ((e.key === 's' || e.key === 'S')) shoot();
  // Ação especial
  if ((e.key === 'd' || e.key === 'D')) special();
});
document.addEventListener('keyup', e => {
  keys[e.key] = false;
});
document.getElementById('restart-btn').onclick = resetGame;

function shoot() {
  if (inCar) return;
  bullets.push({
    x: player.x + player.w/2 * player.dir,
    y: player.y + player.h/2,
    vx: 10 * player.dir,
    vy: 0,
    color: "#ffeb3b"
  });
}

function special() {
  if (item === "jetpack" || player.jetpack) {
    player.vy = -8;
  }
  if (item === "car" && !inCar && Math.abs(player.x-car.x)<40 && Math.abs(player.y-car.y)<40) {
    inCar = true;
    car.taken = true;
  }
}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x, player.y);
  // Corpo
  ctx.fillStyle = player.color;
  ctx.fillRect(0, 0, player.w, player.h);
  // Cabeça
  ctx.fillStyle = "#fff";
  ctx.fillRect(6, 0, 20, 18);
  // Braço
  ctx.fillStyle = "#bdbdbd";
  ctx.fillRect(player.dir>0?player.w-8:-8, 18, 8, 12);
  // Pernas
  ctx.fillStyle = "#039be5";
  ctx.fillRect(6, player.h-12, 8, 12);
  ctx.fillRect(18, player.h-12, 8, 12);
  // Jetpack
  if (item === "jetpack" || player.jetpack) {
    ctx.fillStyle = "#ff4081";
    ctx.fillRect(-6, 18, 8, 18);
    if (keys && keys['d']) {
      ctx.fillStyle = "#ffeb3b";
      ctx.fillRect(-4, 36, 4, 12);
    }
  }
  ctx.restore();
}

function drawCar() {
  if (car.taken) return;
  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.fillStyle = "#8bc34a";
  ctx.fillRect(0, 0, car.w, car.h);
  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.arc(10, car.h, 8, 0, Math.PI*2);
  ctx.arc(car.w-10, car.h, 8, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}

function drawPlatforms() {
  ctx.save();
  ctx.fillStyle = "#607d8b";
  for (let p of platforms) {
    ctx.fillRect(p.x, p.y, p.w, p.h);
  }
  ctx.restore();
}

function drawEnemies() {
  for (let e of enemies) {
    if (!e.alive) continue;
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.fillStyle = "#e53935";
    ctx.fillRect(0, 0, e.w, e.h);
    ctx.fillStyle = "#fff";
    ctx.fillRect(8, 4, 8, 8);
    ctx.restore();
  }
}

function drawItems() {
  for (let it of items) {
    if (it.taken) continue;
    ctx.save();
    ctx.translate(it.x, it.y);
    if (it.type === "jetpack") {
      ctx.fillStyle = "#ff4081";
      ctx.fillRect(0, 0, 12, 24);
    } else if (it.type === "life") {
      ctx.fillStyle = "#00ffe7";
      ctx.beginPath();
      ctx.arc(8, 8, 8, 0, Math.PI*2);
      ctx.fill();
    } else if (it.type === "car") {
      ctx.fillStyle = "#8bc34a";
      ctx.fillRect(0, 0, 24, 12);
    }
    ctx.restore();
  }
}

function drawBoss() {
  if (!boss.alive) return;
  ctx.save();
  ctx.translate(boss.x, boss.y);
  ctx.fillStyle = "#ff7043";
  ctx.fillRect(0, 0, boss.w, boss.h);
  ctx.fillStyle = "#fff";
  ctx.fillRect(12, 8, 20, 16);
  ctx.restore();
}

function drawBullets() {
  for (let b of bullets) {
    ctx.save();
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.arc(b.x, b.y, 6, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
}

function update() {
  // Movimento
  if (inCar) {
    player.speed = 8;
    player.jump = -6;
  } else {
    player.speed = 4;
    player.jump = -12;
  }
  if (keys && keys["ArrowLeft"]) { player.x -= player.speed; player.dir = -1; }
  if (keys && keys["ArrowRight"]) { player.x += player.speed; player.dir = 1; }
  if (!inCar) player.x = Math.max(0, Math.min(WIDTH-player.w, player.x));
  // Gravidade
  player.vy += 0.7;
  player.y += player.vy;
  // Plataformas
  player.onGround = false;
  for (let p of platforms) {
    if (player.x + player.w > p.x && player.x < p.x + p.w &&
        player.y + player.h > p.y && player.y + player.h < p.y + p.h + 16 &&
        player.vy >= 0) {
      player.y = p.y - player.h;
      player.vy = 0;
      player.onGround = true;
    }
  }
  // Itens
  for (let it of items) {
    if (it.taken) continue;
    if (Math.abs(player.x-it.x)<24 && Math.abs(player.y-it.y)<24) {
      if (it.type === "jetpack") { item = "jetpack"; player.jetpack = true; }
      if (it.type === "life") { lives++; }
      if (it.type === "car") { item = "car"; }
      it.taken = true;
      updateHUD();
    }
  }
  // Carro
  if (inCar) {
    player.y = car.y - player.h + 8;
    if (keys && keys["a"] && player.onGround) { inCar = false; item = null; }
  }
  // Inimigos
  for (let e of enemies) {
    if (!e.alive) continue;
    e.x += e.vx;
    if (e.x < 0 || e.x > WIDTH-e.w) e.vx *= -1;
    // Colisão com player
    if (Math.abs(player.x-e.x)<28 && Math.abs(player.y-e.y)<32) {
      lives--;
      player.x = 60; player.y = HEIGHT-80; player.vy = 0;
      if (lives <= 0) { gameOver = true; }
      updateHUD();
    }
  }
  // Boss
  if (boss.alive) {
    boss.x += Math.sin(Date.now()/600)*2;
    // Colisão com player
    if (Math.abs(player.x-boss.x)<40 && Math.abs(player.y-boss.y)<48) {
      lives--;
      player.x = 60; player.y = HEIGHT-80; player.vy = 0;
      if (lives <= 0) { gameOver = true; }
      updateHUD();
    }
  }
  // Bullets
  for (let b of bullets) {
    b.x += b.vx;
    b.y += b.vy;
    // Inimigos
    for (let e of enemies) {
      if (!e.alive) continue;
      if (Math.abs(b.x-e.x)<24 && Math.abs(b.y-e.y)<24) {
        e.hp--;
        if (e.hp <= 0) e.alive = false;
        b.x = -1000;
      }
    }
    // Boss
    if (boss.alive && Math.abs(b.x-boss.x)<40 && Math.abs(b.y-boss.y)<48) {
      boss.hp--;
      if (boss.hp <= 0) { boss.alive = false; bossDefeated = true; }
      b.x = -1000;
    }
  }
  bullets = bullets.filter(b => b.x > -20 && b.x < WIDTH+20);

  // Fim de fase
  if (bossDefeated && player.x > WIDTH-60) {
    level++;
    if (level > 20) {
      gameOver = true;
    } else {
      bossDefeated = false;
      startLevel();
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawPlatforms();
  drawItems();
  drawCar();
  drawEnemies();
  drawBoss();
  drawBullets();
  drawPlayer();
  if (gameOver) {
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
