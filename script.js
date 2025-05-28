const canvas = document.getElementById('pinball');
const ctx = canvas.getContext('2d');
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let ball, leftFlipper, rightFlipper, bumpers, score, gameOver, animationId;

function resetGame() {
    // Bola
    ball = {
        x: WIDTH / 2,
        y: HEIGHT - 100,
        radius: 12,
        dx: 2 * (Math.random() > 0.5 ? 1 : -1),
        dy: -4,
        color: "#fff"
    };

    // Palhetas (flippers)
    const flipperLength = 90;
    const flipperWidth = 18;
    const flipperY = HEIGHT - 50;
    leftFlipper = {
        x: WIDTH / 2 - 70,
        y: flipperY,
        angle: -30,
        isUp: false,
        length: flipperLength,
        width: flipperWidth
    };
    rightFlipper = {
        x: WIDTH / 2 + 70,
        y: flipperY,
        angle: 30,
        isUp: false,
        length: flipperLength,
        width: flipperWidth
    };

    // 10 bumpers coloridos, distribuídos
    bumpers = [
        {x: WIDTH/2, y: 120, r: 18, color: "#ffeb3b"},
        {x: WIDTH/2-80, y: 170, r: 15, color: "#ff4081"},
        {x: WIDTH/2+80, y: 170, r: 15, color: "#4caf50"},
        {x: WIDTH/2-120, y: 250, r: 13, color: "#00bcd4"},
        {x: WIDTH/2+120, y: 250, r: 13, color: "#e91e63"},
        {x: WIDTH/2-60, y: 320, r: 15, color: "#ff9800"},
        {x: WIDTH/2+60, y: 320, r: 15, color: "#3f51b5"},
        {x: WIDTH/2-40, y: 220, r: 12, color: "#cddc39"},
        {x: WIDTH/2+40, y: 220, r: 12, color: "#9c27b0"},
        {x: WIDTH/2, y: 400, r: 18, color: "#00e676"}
    ];

    score = 0;
    gameOver = false;
    document.getElementById('score').textContent = "Pontos: 0";
    cancelAnimationFrame(animationId);
    loop();
}

// Controle das palhetas
document.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'a') leftFlipper.isUp = true;
    if (e.key.toLowerCase() === 'l') rightFlipper.isUp = true;
});
document.addEventListener('keyup', e => {
    if (e.key.toLowerCase() === 'a') leftFlipper.isUp = false;
    if (e.key.toLowerCase() === 'l') rightFlipper.isUp = false;
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
    let angle = isLeft ? (f.isUp ? -Math.PI/5 : Math.PI/8) : (f.isUp ? Math.PI/5 : -Math.PI/8);
    ctx.rotate(angle);
    ctx.fillStyle = isLeft ? "#ff4081" : "#4caf50";
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-f.length/2, -f.width/2, f.length, f.width, 8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
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
    let angle = isLeft ? (f.isUp ? -Math.PI/5 : Math.PI/8) : (f.isUp ? Math.PI/5 : -Math.PI/8);
    let flipperEndX = fx + Math.cos(angle) * f.length/2;
    let flipperEndY = fy + Math.sin(angle) * f.length/2;
    let dist = Math.hypot(ball.x - flipperEndX, ball.y - flipperEndY);
    if (dist < ball.radius + f.width/2 + 2 && ball.y < fy + 10 && ball.y > fy - 40) {
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
