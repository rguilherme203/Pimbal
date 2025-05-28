const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const launchButton = document.getElementById('launchButton');
const scoreDisplay = document.getElementById('score');
const ballsDisplay = document.getElementById('balls');

let score = 0;
let ballsLeft = 3;
let ball = { x: 200, y: 550, dx: 0, dy: -5, radius: 10 };
let leftFlipper = { x: 150, y: 550, active: false, angle: 0 };
let rightFlipper = { x: 250, y: 550, active: false, angle: 0 };
let gameRunning = false;

const bumpers = [
    { x: 100, y: 200, radius: 20 },
    { x: 300, y: 200, radius: 20 },
    { x: 200, y: 300, radius: 20 }
];
const slingshots = [
    { x: 100, y: 500, width: 30, height: 20 },
    { x: 270, y: 500, width: 30, height: 20 }
];

function launchBall() {
    if (ballsLeft > 0 && !gameRunning) {
        ball.dx = (Math.random() - 0.5) * 8;
        ball.dy = -8;
        gameRunning = true;
    }
}

function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.y > canvas.height) {
        ballsLeft--;
        ballsDisplay.textContent = ballsLeft;
        resetBall();
        if (ballsLeft === 0) gameRunning = false;
    }

    // Bounce off walls
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) ball.dx = -ball.dx;
    if (ball.y - ball.radius < 0) ball.dy = -ball.dy;
}

function checkCollisions() {
    // Flipper collision
    if (collides(ball, leftFlipper) && leftFlipper.active) {
        ball.dy = -Math.abs(ball.dy);
        score += 50;
    }
    if (collides(ball, rightFlipper) && rightFlipper.active) {
        ball.dy = -Math.abs(ball.dy);
        score += 50;
    }

    // Bumper collision
    bumpers.forEach(bumper => {
        if (collides(ball, bumper)) {
            ball.dx += (ball.x - bumper.x) * 0.1;
            ball.dy += (ball.y - bumper.y) * 0.1;
            score += 100;
        }
    });

    // Slingshot collision
    slingshots.forEach(slingshot => {
        if (collides(ball, slingshot)) {
            ball.dy = -Math.abs(ball.dy) * 1.2;
            score += 50;
        }
    });
}

function collides(ball, obj) {
    if (obj.radius) {
        return Math.hypot(ball.x - obj.x, ball.y - obj.y) < ball.radius + obj.radius;
    } else {
        return ball.x < obj.x + obj.width && ball.x > obj.x &&
               ball.y < obj.y + obj.height && ball.y > obj.y;
    }
}

function moveFlippers() {
    if (leftFlipper.active) leftFlipper.angle = Math.min(leftFlipper.angle + 0.1, 0.5);
    else leftFlipper.angle = Math.max(leftFlipper.angle - 0.1, 0);
    if (rightFlipper.active) rightFlipper.angle = Math.min(rightFlipper.angle + 0.1, 0.5);
    else rightFlipper.angle = Math.max(rightFlipper.angle - 0.1, 0);
}

function resetBall() {
    ball.x = 200;
    ball.y = 550;
    ball.dx = 0;
    ball.dy = 0;
    gameRunning = false;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1a0033';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    // Draw flippers
    ctx.save();
    ctx.translate(leftFlipper.x, leftFlipper.y);
    ctx.rotate(leftFlipper.angle);
    ctx.fillStyle = '#ff0';
    ctx.fillRect(0, 0, 50, 10);
    ctx.restore();

    ctx.save();
    ctx.translate(rightFlipper.x, rightFlipper.y);
    ctx.rotate(-rightFlipper.angle);
    ctx.fillStyle = '#ff0';
    ctx.fillRect(0, 0, 50, 10);
    ctx.restore();

    // Draw bumpers
    bumpers.forEach(bumper => {
        ctx.beginPath();
        ctx.arc(bumper.x, bumper.y, bumper.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#0ff';
        ctx.fill();
    });

    // Draw slingshots
    slingshots.forEach(slingshot => {
        ctx.fillStyle = '#f0f';
        ctx.fillRect(slingshot.x, slingshot.y, slingshot.width, slingshot.height);
    });

    scoreDisplay.textContent = score;
    requestAnimationFrame(draw);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') leftFlipper.active = true;
    if (e.key === 'ArrowRight') rightFlipper.active = true;
});
document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') leftFlipper.active = false;
    if (e.key === 'ArrowRight') rightFlipper.active = false;
});

launchButton.addEventListener('click', launchBall);

function gameLoop() {
    if (gameRunning) {
        moveBall();
        checkCollisions();
        moveFlippers();
    }
    requestAnimationFrame(gameLoop);
}

gameLoop();
draw();
