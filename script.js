const canvas = document.getElementById('pinball');
const ctx = canvas.getContext('2d');
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let balls, leftFlipper, rightFlipper, bumpers, score, gameOver, animationId, accAnim = 0, multiAnim = 0, labAnim = 0;

function resetGame() {
    // Bola(s) - mais rápida
    balls = [{
        x: WIDTH / 2,
        y: HEIGHT - 140,
        radius: 15,
        dx: 3.8 * (Math.random() > 0.5 ? 1 : -1),
        dy: -6,
        color: "#fff",
        speed: 1.3,
        trail: []
    }];

    // Palhetas (flippers) em formato de cone
    const flipperLength = 160;
    const flipperWidthBase = 38;
    const flipperWidthTip = 12;
    const flipperY = HEIGHT - 70;
    leftFlipper = {
        x: WIDTH / 2 - 90,
        y: flipperY,
        angle: -30,
        isUp: false,
        length: flipperLength,
        widthBase: flipperWidthBase,
        widthTip: flipperWidthTip
    };
    rightFlipper = {
        x: WIDTH / 2 + 90,
        y: flipperY,
        angle: 30,
        isUp: false,
        length: flipperLength,
        widthBase: flipperWidthBase,
        widthTip: flipperWidthTip
    };

    // 7 obstáculos modernos e animados
    bumpers = [
        {x: WIDTH/2, y: 120, r: 28, color: "#ffeb3b", type: "normal"},
        {x: WIDTH/2-100, y: 220, r: 22, color: "#00ffe7", type: "accelerator"},
        {x: WIDTH/2+100, y: 220, r: 22, color: "#ff00ff", type: "multi"},
        {x: WIDTH/2-60, y: 340, r: 24, color: "#00ff00", type: "labyrinth"},
        {x: WIDTH/2+60, y: 340, r: 24, color: "#ff9800", type: "normal"},
        {x: WIDTH/2-40, y: 500, r: 20, color: "#00bcd4", type: "normal"},
        {x: WIDTH/2+40, y: 500, r: 20, color: "#e91e63", type: "normal"}
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

// --- Desenho ---

function drawBall(ball) {
    // Rastro
    for (let i = 0; i < ball.trail.length; i++) {
        let t = ball.trail[i];
        ctx.beginPath();
        ctx.arc(t.x, t.y, ball.radius * (0.7 - i*0.07), 0, Math.PI*2);
        ctx.fillStyle = `rgba(0,255,255,${0.15 - i*0.02})`;
        ctx.fill();
        ctx.closePath();
    }
    // Bola
    let grad = ctx.createRadialGradient(ball.x, ball.y, ball.radius*0.2, ball.x, ball.y, ball.radius);
    grad.addColorStop(0, "#fff");
    grad.addColorStop(0.5, "#00ffe7");
    grad.addColorStop(1, "#00bcd4");
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    ctx.fillStyle = grad;
    ctx.shadowColor = "#00ffe7";
    ctx.shadowBlur = 18;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.closePath();
}

function drawFlipper(f, isLeft) {
    ctx.save();
    ctx.translate(f.x, f.y);
    let angle = isLeft ? (f.isUp ? -Math.PI/4 : Math.PI/7) : (f.isUp ? Math.PI/4 : -Math.PI/7);
    ctx.rotate(angle);

    // Efeito metálico
    let grad = ctx.createLinearGradient(-f.length/2, 0, f.length/2, 0);
    grad.addColorStop(0, isLeft ? "#ff4081" : "#4caf50");
    grad.addColorStop(0.5, "#fff");
    grad.addColorStop(1, isLeft ? "#ff4081" : "#4caf50");

    ctx.fillStyle = grad;
    ctx.strokeStyle = "#00ffe7";
    ctx.lineWidth = 5;
    ctx.beginPath();
    coneFlipper(ctx, -f.length/2, -f.widthBase/2, f.length, f.widthBase, f.widthTip);
    ctx.fill();
    ctx.stroke();
    // Reflexo
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    coneFlipper(ctx, -f.length/2+8, -f.widthBase/2+4, f.length-16, f.widthBase-8, f.widthTip-4);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
}

// Função para desenhar palheta em formato de cone
function coneFlipper(ctx, x, y, length, widthBase, widthTip) {
    ctx.moveTo(x, y);
    ctx.lineTo(x + length, y + (widthTip - widthBase)/2);
    ctx.lineTo(x + length, y + widthBase - (widthBase - widthTip)/2);
    ctx.lineTo(x, y + widthBase);
    ctx.closePath();
}

function drawBumpers() {
    bumpers.forEach(b => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
        // Efeitos especiais
        if (b.type === "accelerator") {
            let grad = ctx.createRadialGradient(b.x, b.y, b.r*0.2, b.x, b.y, b.r);
            grad.addColorStop(0, "#fff");
            grad.addColorStop(0.5, "#00ffe7");
            grad.addColorStop(1, "#00bcd4");
            ctx.fillStyle = grad;
            ctx.shadowColor = "#00ffe7";
            ctx.shadowBlur = 24 + 8*Math.abs(Math.sin(accAnim));
        } else if (b.type === "multi") {
            let grad = ctx.createRadialGradient(b.x, b.y, b.r*0.2, b.x, b.y, b.r);
            grad.addColorStop(0, "#fff");
            grad.addColorStop(0.5, "#ff00ff");
            grad.addColorStop(1, "#e040fb");
            ctx.fillStyle = grad;
            ctx.shadowColor = "#ff00ff";
            ctx.shadowBlur = 18 + 8*Math.abs(Math.sin(multiAnim));
        } else if (b.type === "labyrinth") {
            let grad = ctx.createRadialGradient(b.x, b.y, b.r*0.2, b.x, b.y, b.r);
            grad.addColorStop(0, "#fff");
            grad.addColorStop(0.5, "#00ff00");
            grad.addColorStop(1, "#388e3c");
            ctx.fillStyle = grad;
            ctx.shadowColor = "#00ff00";
            ctx.shadowBlur = 18 + 8*Math.abs(Math.sin(labAnim));
        } else {
            ctx.fillStyle = b.color;
            ctx.shadowColor = "#fff";
            ctx.shadowBlur = 8;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#fff";
        ctx.stroke();
        ctx.closePath();

        // Animação labirinto
        if (b.type === "labyrinth") {
            ctx.save();
            ctx.globalAlpha = 0.5 + 0.3*Math.abs(Math.sin(labAnim));
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let i = 0; i < 3; i++) {
                ctx.arc(b.x, b.y, b.r-4-i*4, 0, Math.PI*2);
            }
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
    });
}

function drawScore() {
    document.getElementById('score').textContent = "Pontos: " + score;
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

function updateBalls() {
    for (let ball of balls) {
        // Rastro
        ball.trail.unshift({x: ball.x, y: ball.y});
        if (ball.trail.length > 10) ball.trail.pop();

        ball.x += ball.dx * ball.speed;
        ball.y += ball.dy * ball.speed;

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

                // Efeitos especiais
                if (b.type === "accelerator") {
                    ball.speed = 2.5;
                    score += 30;
                    accAnim = 0;
                    setTimeout(() => { ball.speed = 1.3; }, 2000);
                } else if (b.type === "multi") {
                    if (balls.length < 3) {
                        balls.push({
                            x: ball.x + 20,
                            y: ball.y,
                            radius: ball.radius,
                            dx: -ball.dx,
                            dy: ball.dy,
                            color: "#fff",
                            speed: 1.3,
                            trail: []
                        });
                        score += 50;
                        multiAnim = 0;
                    }
                } else if (b.type === "labyrinth") {
                    // Teleporta para o outro lado
                    ball.x = WIDTH - ball.x;
                    ball.y = 100 + Math.random()*100;
                    ball.dx = -ball.dx;
                    ball.dy = Math.abs(ball.dy);
                    score += 40;
                    labAnim = 0;
                } else {
                    score += 10;
                }
            }
        });

        // Palhetas
        checkFlipperCollision(leftFlipper, true, ball);
        checkFlipperCollision(rightFlipper, false, ball);
    }

    // Fim de jogo se todas bolas caírem
    balls = balls.filter(ball => ball.y - ball.radius <= HEIGHT);
    if (balls.length === 0) gameOver = true;
}

function checkFlipperCollision(f, isLeft, ball) {
    let fx = f.x;
    let fy = f.y;
    let angle = isLeft ? (f.isUp ? -Math.PI/4 : Math.PI/7) : (f.isUp ? Math.PI/4 : -Math.PI/7);
    let flipperEndX = fx + Math.cos(angle) * f.length/2;
    let flipperEndY = fy + Math.sin(angle) * f.length/2;
    let dist = Math.hypot(ball.x - flipperEndX, ball.y - flipperEndY);
    if (dist < ball.radius + f.widthBase/2 + 2 && ball.y < fy + 30 && ball.y > fy - 80) {
        ball.dy = -Math.abs(ball.dy);
        ball.dx += (isLeft ? -1 : 1) * 1.2 * Math.random();
        score += 2;
    }
}

function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    drawBumpers();
    for (let ball of balls) drawBall(ball);
    drawFlipper(leftFlipper, true);
    drawFlipper(rightFlipper, false);
    drawScore();
    if (gameOver) drawGameOver();
}

function loop() {
    accAnim += 0.08;
    multiAnim += 0.09;
    labAnim += 0.07;
    if (!gameOver) {
        updateBalls();
        draw();
        animationId = requestAnimationFrame(loop);
    } else {
        draw();
    }
}

// Iniciar o jogo ao carregar
resetGame();
