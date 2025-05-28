const canvas = document.getElementById('pinball');
const ctx = canvas.getContext('2d');
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let ball, leftFlipper, rightFlipper, bumpers, score, gameOver, animationId;

function resetGame() {
    // Bola
    ball = {
        x: WIDTH / 2,
        y: HEIGHT - 120,
        radius: 14,
        dx: 2.5 * (Math.random() > 0.5 ? 1 : -1),
        dy: -4,
        color: "#fff"
    };

    // Palhetas (flippers) maiores e arredondadas
    const flipperLength = 130;
    const flipperWidth = 28;
    const flipperY = HEIGHT - 60;
    leftFlipper = {
        x: WIDTH / 2 - 80,
        y: flipperY,
        angle: -30,
        isUp: false,
        length: flipperLength,
        width: flipperWidth
    };
    rightFlipper = {
        x: WIDTH / 2 + 80,
        y: flipperY,
        angle: 30,
        isUp: false,
        length: flipperLength,
        width: flipperWidth
    };

    // 15 bumpers coloridos, distribuídos
    bumpers = [
        {x: WIDTH/2, y: 100, r: 18, color: "#ffeb3b"},
        {x: WIDTH/2-80, y: 150, r: 15, color: "#ff4081"},
        {x: WIDTH/2+80, y: 150, r: 15, color: "#4caf50"},
        {x: WIDTH/2-120, y: 220, r: 13, color: "#00bcd4"},
        {x: WIDTH/2+120, y: 220, r: 13, color: "#e91e63"},
        {x: WIDTH/2-60, y: 300, r: 15, color: "#ff9800"},
        {x: WIDTH/2+60, y: 300, r: 15, color: "#3f51b5"},
        {x: WIDTH/2-40, y: 200, r: 12, color: "#cddc39"},
        {x: WIDTH/2+40, y: 200, r: 12, color: "#9c27b0"},
        {x: WIDTH/2, y: 380, r: 18, color: "#00e676"},
        {x: WIDTH/2-100, y: 400, r: 13, color: "#ff5722"},
        {x: WIDTH/2+100, y: 400, r: 13, color: "#2196f3"},
        {x: WIDTH/2-60, y: 480, r: 15, color: "#ffc107"},
        {x: WIDTH/2+60, y: 480, r: 15, color: "#8bc34a"},
        {x: WIDTH/2, y: 520, r: 18, color: "#607d8b"}
    ];

    score = 0;
    gameOver = false;
    document.getElementById('score').textContent = "Pontos: 0";
    cancelAnimationFrame(animationId);
    loop();
}

// Controle das palhetas (robusto para A/a e L/l)
document.addEventListener('keydown', function(e) {
    if (e.key === 'a' || e.key === 'A') leftFlipper.isUp = true;
    if (e.key === 'l' || e.key === 'L') rightFlipper.isUp = true;
});
document.addEventListener('keyup', function(e) {
    if (e.key === 'a' || e.key === 'A') leftFlipper.isUp = false;
    if (e.key === 'l' || e.key === 'L') rightFlipper.isUp = false;
});

document.getElementById('restart-btn').onclick = resetGame;

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    ctx.fillStyle = ball.color;
    ctx.shadowColor = "#fff";
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.closePath();
}

function drawFlipper(f, isLeft) {
    ctx.save();
    ctx.translate(f.x, f.y);
    let angle = isLeft ? (f.isUp ? -Math.PI/4 : Math.PI/7) : (f.isUp ? Math.PI/4 : -Math.PI/7);
    ctx.rotate(angle);
    ctx.fillStyle = isLeft ? "#ff4081" : "#4caf50";
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    roundedFlipper(ctx, -f.length/2, -f.width/2, f.length, f.width, f.width/2.2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}

// Função para desenhar palheta arredondada
function roundedFlipper(ctx, x, y, w, h, r) {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
}

function drawBumpers() {
    bumpers.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
        ctx.fillStyle = b.color;
        ctx.shadowColor = "#fff";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#fff";
        ctx.stroke();
        ctx.closePath();
    });
}

function drawScore() {
    document.getElementById('score').textContent = "Pontos: " + score;
}

function drawGameOver() {
    ctx.font = "32px Arial";
    ctx.fillStyle = "#ff4081";
    ctx.textAlign = "center";
    ctx.fillText("Game Over!", WIDTH/2, HEIGHT/2);
    ctx.font = "20px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText("Clique em Reiniciar para jogar de novo.", WIDTH/2, HEIGHT/2 + 40);
}

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Paredes
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > WIDTH) ball.dx *= -1;
    if (ball.y - ball.radius < 0) ball.dy *= -1;

    // Bumpers
    bumpers.forEach(b => {
        let dist = Math.hypot(ball.x - b.x, ball.y - b.y);
        if (dist < ball.radius + b.r) {
            // Rebater
            let angle = Math.atan2(ball.y - b.y, ball.x - b.x);
            ball.dx = Math.cos(angle) * Math.abs(ball.dx);
            ball.dy = Math.sin(angle) * Math.abs(ball.dy);
            score += 10;
        }
    });

    // Palhetas
    checkFlipperCollision(leftFlipper, true);
    checkFlipperCollision(rightFlipper, false);

    // Fim de jogo
    if (ball.y - ball.radius > HEIGHT) {
        gameOver = true;
    }
}

function checkFlipperCollision(f, isLeft) {
    // Área aproximada da palheta
    let fx = f.x;
    let fy = f.y;
    let angle = isLeft ? (f.isUp ? -Math.PI/4 : Math.PI/7) : (f.isUp ? Math.PI/4 : -Math.PI/7);
    let flipperEndX = fx + Math.cos(angle) * f.length/2;
    let flipperEndY = fy + Math.sin(angle) * f.length/2;
    let dist = Math.hypot(ball.x - flipperEndX, ball.y - flipperEndY);
    if (dist < ball.radius + f.width/2 + 2 && ball.y < fy + 20 && ball.y > fy - 60) {
        ball.dy = -Math.abs(ball.dy);
        ball.dx += (isLeft ? -1 : 1) * 1.2 * Math.random();
        score += 2;
    }
}

function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    drawBumpers();
    drawBall();
    drawFlipper(leftFlipper, true);
    drawFlipper(rightFlipper, false);
    drawScore();
    if (gameOver) drawGameOver();
}

function loop() {
    if (!gameOver) {
        updateBall();
        draw();
        animationId = requestAnimationFrame(loop);
    } else {
        draw();
    }
}

// Iniciar o jogo ao carregar
resetGame();
