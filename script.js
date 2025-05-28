const canvas = document.getElementById('pinball');
const ctx = canvas.getContext('2d');
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let balls, leftFlipper, rightFlipper, obstacles, score, gameOver, animationId;
let bumperAnim = 0, portalAnim = 0, arrowAnim = 0;

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

    // Palhetas grandes, finas, vermelhas, inclinadas
    const flipperLength = 140;
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

    // Obstáculos: bumpers, portais, nave, planetas, todos afastados das palhetas
    obstacles = [
        {type: "bumper", x: WIDTH/2-70, y: 160, size: 38, effect: "score"},
        {type: "bumper", x: WIDTH/2+70, y: 160, size: 38, effect: "score"},
        {type: "bumper", x: WIDTH/2, y: 220, size: 38, effect: "score"},
        {type: "portal", x: WIDTH/2-90, y: 320, size: 32, effect: "portal"},
        {type: "portal", x: WIDTH/2+90, y: 320, size: 32, effect: "portal"},
        {type: "planet", x: WIDTH/2, y: 400, size: 44, effect: "score"},
        {type: "spaceship", x: WIDTH/2, y: 100, size: 38, effect: "multi"}
    ];

    score = 0;
    gameOver = false;
    document.getElementById('score').textContent = "0000000";
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
    // Campo ovalado
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(WIDTH/2, HEIGHT/2, WIDTH/2-10, HEIGHT/2-20, 0, 0, Math.PI*2);
    ctx.fillStyle = "#181c2b";
    ctx.shadowColor = "#00ffe7";
    ctx.shadowBlur = 30;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#00ffe7";
    ctx.stroke();
    ctx.restore();

    // Trilhas laterais
    ctx.save();
    ctx.strokeStyle = "#00ffe7";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(30, 80); ctx.lineTo(30, HEIGHT-120);
    ctx.moveTo(WIDTH-30, 80); ctx.lineTo(WIDTH-30, HEIGHT-120);
    ctx.stroke();
    ctx.restore();

    // Setas
    for (let i = 0; i < 3; i++) {
        drawArrow(WIDTH/2, 80 + i*40, 0, "#ffeb3b");
    }
    // Luzes decorativas
    for (let i = 0; i < 8; i++) {
        let angle = Math.PI/8 * i + arrowAnim/2;
        let x = WIDTH/2 + Math.cos(angle) * 160;
        let y = 120 + Math.sin(angle) * 60;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI*2);
        ctx.fillStyle = i%2===0 ? "#ff4081" : "#00ffe7";
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    ctx.restore();
}

function drawArrow(x, y, rot, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(8, 8);
    ctx.lineTo(-8, 8);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
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

    // Palheta vermelha com detalhe branco
    ctx.beginPath();
    coneFlipper(ctx, -f.length/2, -f.widthBase/2, f.length, f.widthBase, f.widthTip);
    ctx.fillStyle = "#e53935";
    ctx.shadowColor = "#fff";
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#fff";
    ctx.stroke();

    // Detalhe branco central
    ctx.beginPath();
    coneFlipper(ctx, -f.length/2+8, -f.widthBase/2+2, f.length-16, f.widthBase-4, f.widthTip-2);
    ctx.fillStyle = "#fff";
    ctx.globalAlpha = 0.18;
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
        if (ob.type === "bumper") {
            // Bumper redondo com luz
            ctx.translate(ob.x, ob.y);
            ctx.beginPath();
            ctx.arc(0, 0, ob.size/2, 0, Math.PI*2);
            ctx.fillStyle = "#222";
            ctx.shadowColor = "#fff";
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.lineWidth = 4;
            ctx.strokeStyle = "#ffeb3b";
            ctx.stroke();
            // Luz animada
            ctx.beginPath();
            ctx.arc(0, 0, ob.size/2-6, 0, Math.PI*2);
            ctx.fillStyle = `rgba(255,235,59,${0.5+0.3*Math.abs(Math.sin(bumperAnim))})`;
            ctx.fill();
            ctx.restore();
        } else if (ob.type === "portal") {
            // Portal animado
            ctx.save();
            ctx.translate(ob.x, ob.y);
            ctx.beginPath();
            for (let i = 0; i < 2; i++) {
                ctx.arc(0, 0, ob.size/2 - i*5, 0, Math.PI*2);
            }
            ctx.strokeStyle = `rgba(0,255,255,${0.5+0.3*Math.abs(Math.sin(portalAnim))})`;
            ctx.lineWidth = 3;
            ctx.shadowColor = "#00ffe7";
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.shadowBlur = 0;
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

// --- GAME LOGIC ---

function drawScore() {
    let s = score.toString().padStart(7, "0");
    document.getElementById('score').textContent = s;
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

        // Paredes ovaladas
        let dx = ball.x - WIDTH/2;
        let dy = ball.y - HEIGHT/2;
        let rx = WIDTH/2-18;
        let ry = HEIGHT/2-28;
        if ((dx*dx)/(rx*rx) + (dy*dy)/(ry*ry) > 1) {
            // Rebater na borda ovalada
            let angle = Math.atan2(dy, dx);
            let norm = {x: Math.cos(angle), y: Math.sin(angle)};
            let dot = ball.dx*norm.x + ball.dy*norm.y;
            ball.dx -= 2*dot*norm.x;
            ball.dy -= 2*dot*norm.y;
        }

        // Obstáculos
        obstacles.forEach(ob => {
            let dist = Math.hypot(ball.x - ob.x, ball.y - ob.y);
            let hit = false;
            if (ob.type === "spaceship") {
                // Triângulo nave
                hit = pointInTriangle(ball.x, ball.y, ob.x, ob.y-ob.size/2, ob.x+ob.size/2, ob.y+ob.size/2, ob.x-ob.size/2, ob.y+ob.size/2, ball.radius);
            } else if (ob.type === "bumper" || ob.type === "planet") {
                hit = dist < ob.size/2 + ball.radius;
            } else if (ob.type === "portal") {
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
    bumperAnim += 0.08;
    portalAnim += 0.07;
    arrowAnim += 0.04;
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
