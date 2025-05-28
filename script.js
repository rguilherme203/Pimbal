const canvas = document.getElementById('pinball');
const ctx = canvas.getContext('2d');
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let balls, leftFlipper, rightFlipper, obstacles, score, gameOver, animationId;
let starAnim = 0, portalAnim = 0, asteroidAnim = 0;

function resetGame() {
    balls = [{
        x: WIDTH / 2,
        y: HEIGHT - 220,
        radius: 13,
        dx: 3.5 * (Math.random() > 0.5 ? 1 : -1),
        dy: -6,
        color: "#fff",
        speed: 1.7,
        trail: []
    }];

    // Palhetas grandes, finas, cone clássico
    const flipperLength = 130;
    const flipperWidthBase = 22;
    const flipperWidthTip = 4;
    const flipperY = HEIGHT - 60;
    leftFlipper = {
        x: WIDTH / 2 - 70,
        y: flipperY,
        angle: -30,
        isUp: false,
        length: flipperLength,
        widthBase: flipperWidthBase,
        widthTip: flipperWidthTip
    };
    rightFlipper = {
        x: WIDTH / 2 + 70,
        y: flipperY,
        angle: 30,
        isUp: false,
        length: flipperLength,
        widthBase: flipperWidthBase,
        widthTip: flipperWidthTip
    };

    // Obstáculos variados, afastados das palhetas e do centro
    obstacles = [
        {type: "hex", x: WIDTH/2-120, y: 120, size: 36, effect: "score"},
        {type: "star", x: WIDTH/2+120, y: 120, size: 32, effect: "score"},
        {type: "portal", x: WIDTH/2-80, y: 260, size: 36, effect: "portal"},
        {type: "asteroid", x: WIDTH/2+80, y: 340, size: 34, effect: "accelerate"},
        {type: "planet", x: WIDTH/2-100, y: 440, size: 44, effect: "score"},
        {type: "spaceship", x: WIDTH/2+100, y: 540, size: 38, effect: "multi"}
    ];

    score = 0;
    gameOver = false;
    document.getElementById('score').textContent = "Pontos: 0";
    cancelAnimationFrame(animationId);
    loop();
}

// Controle das palhetas (A/a e L/l)
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

function drawBackground() {
    // Fundo estrelado
    ctx.save();
    for (let i = 0; i < 120; i++) {
        let x = Math.random() * WIDTH;
        let y = Math.random() * HEIGHT;
        let r = Math.random() * 1.2;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,255,255,${0.15 + Math.random()*0.3})`;
        ctx.fill();
    }
    ctx.restore();
}

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
    ctx.lineWidth = 3;
    ctx.beginPath();
    coneFlipper(ctx, -f.length/2, -f.widthBase/2, f.length, f.widthBase, f.widthTip);
    ctx.fill();
    ctx.stroke();
    // Reflexo
    ctx.globalAlpha = 0.18;
    ctx.beginPath();
    coneFlipper(ctx, -f.length/2+4, -f.widthBase/2+2, f.length-8, f.widthBase-4, f.widthTip-2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
}

// Palheta cone
function coneFlipper(ctx, x, y, length, widthBase, widthTip) {
    ctx.moveTo(x, y);
    ctx.lineTo(x + length, y + (widthTip - widthBase)/2);
    ctx.lineTo(x + length, y + widthBase - (widthBase - widthTip)/2);
    ctx.lineTo(x, y + widthBase);
    ctx.closePath();
}

// Obstáculos espaciais
function drawObstacles() {
    obstacles.forEach(ob => {
        ctx.save();
        if (ob.type === "hex") {
            // Hexágono
            ctx.translate(ob.x, ob.y);
            ctx.rotate(starAnim/2);
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                let angle = (Math.PI*2/6)*i;
                ctx.lineTo(Math.cos(angle)*ob.size/2, Math.sin(angle)*ob.size/2);
            }
            ctx.closePath();
            ctx.fillStyle = "#00bcd4";
            ctx.shadowColor = "#fff";
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
        } else if (ob.type === "star") {
            // Estrela animada
            ctx.save();
            ctx.translate(ob.x, ob.y);
            ctx.rotate(starAnim);
            drawStar(ctx, 0, 0, ob.size/2, ob.size/4, 5);
            ctx.fillStyle = "#ffeb3b";
            ctx.shadowColor = "#fff";
            ctx.shadowBlur = 18;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.restore();
        } else if (ob.type === "portal") {
            // Portal animado
            ctx.save();
            ctx.translate(ob.x, ob.y);
            ctx.beginPath();
            for (let i = 0; i < 3; i++) {
                ctx.arc(0, 0, ob.size/2 - i*5, 0, Math.PI*2);
            }
            ctx.strokeStyle = `rgba(0,255,255,${0.5+0.3*Math.abs(Math.sin(portalAnim))})`;
            ctx.lineWidth = 4;
            ctx.shadowColor = "#00ffe7";
            ctx.shadowBlur = 18;
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.restore();
        } else if (ob.type === "asteroid") {
            // Asteroide irregular
            ctx.save();
            ctx.translate(ob.x, ob.y);
            ctx.rotate(asteroidAnim);
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                let angle = (Math.PI*2/8)*i;
                let r = ob.size/2 + (i%2===0?6:-6);
                ctx.lineTo(Math.cos(angle)*r, Math.sin(angle)*r);
            }
            ctx.closePath();
            ctx.fillStyle = "#888";
            ctx.shadowColor = "#fff";
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
        } else if (ob.type === "planet") {
            // Planeta com anel
            ctx.save();
            ctx.translate(ob.x, ob.y);
            ctx.beginPath();
            ctx.arc(0, 0, ob.size/2, 0, Math.PI*2);
            ctx.fillStyle = "#8bc34a";
            ctx.shadowColor = "#fff";
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            ctx.stroke();
            // Anel
            ctx.beginPath();
            ctx.ellipse(0, 0, ob.size/2+8, ob.size/4, Math.PI/6, 0, Math.PI*2);
            ctx.strokeStyle = "#fff";
            ctx.globalAlpha = 0.5;
            ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.restore();
        } else if (ob.type === "spaceship") {
            // Nave triangular
            ctx.translate(ob.x, ob.y);
            ctx.rotate(-Math.PI/10);
            ctx.beginPath();
            ctx.moveTo(0, -ob.size/2);
            ctx.lineTo(ob.size/2, ob.size/2);
            ctx.lineTo(-ob.size/2, ob.size/2);
            ctx.closePath();
            ctx.fillStyle = "#fff";
            ctx.shadowColor = "#00ffe7";
            ctx.shadowBlur = 18;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = "#00ffe7";
            ctx.lineWidth = 3;
            ctx.stroke();
            // Janelas
            ctx.beginPath();
            ctx.arc(0, 0, ob.size/7, 0, Math.PI*2);
            ctx.fillStyle = "#00ffe7";
            ctx.globalAlpha = 0.7;
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.restore();
        }
        ctx.restore();
    });
}

// Estrela
function drawStar(ctx, x, y, r, r2, n) {
    ctx.beginPath();
    for (let i = 0; i < 2*n+1; i++) {
        let angle = i * Math.PI / n;
        let rad = i%2===0 ? r : r2;
        ctx.lineTo(x + Math.cos(angle)*rad, y + Math.sin(angle)*rad);
    }
    ctx.closePath();
}

// --- GAME LOGIC ---

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

        // Obstáculos
        obstacles.forEach(ob => {
            let dist = Math.hypot(ball.x - ob.x, ball.y - ob.y);
            let hit = false;
            if (ob.type === "spaceship") {
                // Triângulo nave
                hit = pointInTriangle(ball.x, ball.y, ob.x, ob.y-ob.size/2, ob.x+ob.size/2, ob.y+ob.size/2, ob.x-ob.size/2, ob.y+ob.size/2, ball.radius);
            } else if (ob.type === "star" || ob.type === "planet" || ob.type === "hex") {
                hit = dist < ob.size/2 + ball.radius;
            } else if (ob.type === "portal") {
                hit = dist < ob.size/2 + ball.radius;
            } else if (ob.type === "asteroid") {
                hit = dist < ob.size/2 + ball.radius;
            }
            if (hit) {
                // Rebater
                let angle = Math.atan2(ball.y - ob.y, ball.x - ob.x);
                ball.dx = Math.cos(angle) * Math.abs(ball.dx);
                ball.dy = Math.sin(angle) * Math.abs(ball.dy);

                // Efeitos únicos
                if (ob.effect === "multi") {
                    if (balls.length < 3) {
                        balls.push({
                            x: ball.x + 20,
                            y: ball.y,
                            radius: ball.radius,
                            dx: -ball.dx,
                            dy: ball.dy,
                            color: "#fff",
                            speed: 1.7,
                            trail: []
                        });
                        score += 50;
                    }
                } else if (ob.effect === "score") {
                    score += 40;
                } else if (ob.effect === "portal") {
                    // Teleporta para o outro lado
                    ball.x = WIDTH - ball.x;
                    ball.y = 100 + Math.random()*100;
                    ball.dx = -ball.dx;
                    ball.dy = Math.abs(ball.dy);
                    score += 30;
                } else if (ob.effect === "accelerate") {
                    ball.speed = 2.5;
                    score += 20;
                    setTimeout(() => { ball.speed = 1.7; }, 2000);
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

// Triângulo nave
function pointInTriangle(px, py, x1, y1, x2, y2, x3, y3, radius) {
    // Borda circular
    let areaOrig = Math.abs((x2-x1)*(y3-y1)-(x3-x1)*(y2-y1));
    let area1 = Math.abs((x1-px)*(y2-py)-(x2-px)*(y1-py));
    let area2 = Math.abs((x2-px)*(y3-py)-(x3-px)*(y2-py));
    let area3 = Math.abs((x3-px)*(y1-py)-(x1-px)*(y3-py));
    return (area1 + area2 + area3) <= areaOrig + radius*8;
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
    drawBackground();
    drawObstacles();
    for (let ball of balls) drawBall(ball);
    drawFlipper(leftFlipper, true);
    drawFlipper(rightFlipper, false);
    drawScore();
    if (gameOver) drawGameOver();
}

function loop() {
    starAnim += 0.05;
    portalAnim += 0.07;
    asteroidAnim += 0.03;
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
