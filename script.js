const canvas = document.getElementById('pinball');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Bola
let ball = {
    x: WIDTH / 2,
    y: HEIGHT - 80,
    radius: 10,
    dx: 2,
    dy: -4
};

// Palhetas (flippers)
const flipperLength = 80;
const flipperWidth = 16;
const flipperY = HEIGHT - 40;
let leftFlipper = {
    x: WIDTH / 2 - 70,
    y: flipperY,
    angle: -30,
    isUp: false
};
let rightFlipper = {
    x: WIDTH / 2 + 70,
    y: flipperY,
    angle: 30,
    isUp: false
};

// Obstáculos simples (bumpers)
const bumpers = [
    {x: WIDTH/2, y: 180, r: 18},
    {x: WIDTH/2-80, y: 250, r: 15},
    {x: WIDTH/2+80, y: 250, r: 15}
];

let score = 0;
let gameOver = false;

// Controle das palhetas
document.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'a') leftFlipper.isUp = true;
    if (e.key.toLowerCase() === 'l') rightFlipper.isUp = true;
});
document.addEventListener('keyup', e => {
    if (e.key.toLowerCase() === 'a') leftFlipper.isUp = false;
    if (e.key.toLowerCase() === 'l') rightFlipper.isUp = false;
});

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.closePath();
}

function drawFlipper(f, isLeft) {
    ctx.save();
    ctx.translate(f.x, f.y);
    let angle = isLeft ? (f.isUp ? -Math.PI/6 : Math.PI/8) : (f.isUp ? Math.PI/6 : -Math.PI/8);
    ctx.rotate(angle);
    ctx.fillStyle = "#ff4081";
    ctx.fillRect(-flipperLength/2, -flipperWidth/2, flipperLength, flipperWidth);
    ctx.restore();
}

function drawBumpers() {
    bumpers.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
        ctx.fillStyle = "#4caf50";
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#fff";
        ctx.stroke();
        ctx.closePath();
    });
}

function drawScore() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "#ffeb3b";
    ctx.fillText("Pontos: " + score, 20, 30);
}

function drawGameOver() {
    ctx.font = "32px Arial";
    ctx.fillStyle = "#ff4081";
    ctx.fillText("Game Over!", WIDTH/2 - 90, HEIGHT/2);
    ctx.font = "20px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText("Atualize a página para jogar de novo.", WIDTH/2 - 120, HEIGHT/2 + 40);
}

function resetBall() {
    ball.x = WIDTH / 2;
    ball.y = HEIGHT - 80;
    ball.dx = 2 * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = -4;
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
            ball.dy *= -1;
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
    let angle = isLeft ? (f.isUp ? -Math.PI/6 : Math.PI/8) : (f.isUp ? Math.PI/6 : -Math.PI/8);
    let flipperEndX = fx + Math.cos(angle) * flipperLength/2;
    let flipperEndY = fy + Math.sin(angle) * flipperLength/2;
    let dist = Math.hypot(ball.x - flipperEndX, ball.y - flipperEndY);
    if (dist < ball.radius + flipperWidth/2 + 2 && ball.y < fy + 10 && ball.y > fy - 30) {
        ball.dy = -Math.abs(ball.dy);
        ball.dx += (isLeft ? -1 : 1) * 1.2 * Math.random();
        score += 2;
    }
}

function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    drawBall();
    drawFlipper(leftFlipper, true);
    drawFlipper(rightFlipper, false);
    drawBumpers();
    drawScore();
    if (gameOver) drawGameOver();
}

function loop() {
    if (!gameOver) {
        updateBall();
        draw();
        requestAnimationFrame(loop);
    } else {
        draw();
    }
}

resetBall();
loop();
