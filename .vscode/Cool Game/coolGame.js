document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const endScreen = document.getElementById('end-screen');
    const finalScoreElement = document.getElementById('finalScore');
    const restartButton = document.getElementById('restart-button');

    let isRunning = true;
    let score = 0;
    let difficultyMultiplier = 1;
    let player = {
        x: 0, y: 0, size: 25, color: '#00ccff',
        velX: 0, velY: 0, shielded: false, shieldTimer: 0
    };
    let enemies = [];
    let stars = [];
    let powerUps = [];
    let particles = [];
    let mousePos = { x: 0, y: 0 };
    const gameSpeed = 2;
    let lastSpawnTime = 0;
    const baseSpawnInterval = 1000;

    function setCanvasSize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        player.x = canvas.width / 2;
        player.y = canvas.height / 2;
    }

    window.addEventListener('resize', setCanvasSize);
    setCanvasSize();

    canvas.addEventListener('mousemove', (e) => {
        mousePos.x = e.clientX;
        mousePos.y = e.clientY;
    });

    restartButton.addEventListener('click', restartGame);

    function createEnemy() {
        const size = Math.random() * 30 + 10;
        const side = Math.floor(Math.random() * 4);
        let x, y, velX, velY;
        const currentEnemySpeed = gameSpeed * difficultyMultiplier;
        
        if (side === 0) { // Top
            x = Math.random() * canvas.width;
            y = -size;
            velX = (player.x - x) / 150;
            velY = Math.random() * 2 + currentEnemySpeed;
        } else if (side === 1) { // Right
            x = canvas.width + size;
            y = Math.random() * canvas.height;
            velX = -(Math.random() * 2 + currentEnemySpeed);
            velY = (player.y - y) / 150;
        } else if (side === 2) { // Bottom
            x = Math.random() * canvas.width;
            y = canvas.height + size;
            velX = (player.x - x) / 150;
            velY = -(Math.random() * 2 + currentEnemySpeed);
        } else { // Left
            x = -size;
            y = Math.random() * canvas.height;
            velX = Math.random() * 2 + currentEnemySpeed;
            velY = (player.y - y) / 150;
        }
        enemies.push({ x, y, size, velX, velY, color: '#ff3333' });
    }

    function createStar() {
        const size = Math.random() * 10 + 5;
        const side = Math.floor(Math.random() * 4);
        let x, y, velX, velY;
        
        if (side === 0) { // Top
            x = Math.random() * canvas.width;
            y = -size;
            velX = (player.x - x) / 200;
            velY = Math.random() * 1 + gameSpeed;
        } else if (side === 1) { // Right
            x = canvas.width + size;
            y = Math.random() * canvas.height;
            velX = -(Math.random() * 1 + gameSpeed);
            velY = (player.y - y) / 200;
        } else if (side === 2) { // Bottom
            x = Math.random() * canvas.width;
            y = canvas.height + size;
            velX = (player.x - x) / 200;
            velY = -(Math.random() * 1 + gameSpeed);
        } else { // Left
            x = -size;
            y = Math.random() * canvas.height;
            velX = Math.random() * 1 + gameSpeed;
            velY = (player.y - y) / 200;
        }
        stars.push({ x, y, size, velX, velY, color: '#ffea00' });
    }

    function createPowerUp() {
        const size = 15;
        const side = Math.floor(Math.random() * 4);
        let x, y, velX, velY;
        
        if (side === 0) { // Top
            x = Math.random() * canvas.width;
            y = -size;
            velX = (player.x - x) / 200;
            velY = Math.random() * 1 + gameSpeed;
        } else if (side === 1) { // Right
            x = canvas.width + size;
            y = Math.random() * canvas.height;
            velX = -(Math.random() * 1 + gameSpeed);
            velY = (player.y - y) / 200;
        } else if (side === 2) { // Bottom
            x = Math.random() * canvas.width;
            y = canvas.height + size;
            velX = (player.x - x) / 200;
            velY = -(Math.random() * 1 + gameSpeed);
        } else { // Left
            x = -size;
            y = Math.random() * canvas.height;
            velX = Math.random() * 1 + gameSpeed;
            velY = (player.y - y) / 200;
        }
        powerUps.push({ x, y, size, velX, velY, color: '#33ff33' });
    }

    function createParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            particles.push({
                x, y,
                velX: (Math.random() - 0.5) * 5,
                velY: (Math.random() - 0.5) * 5,
                color,
                size: Math.random() * 5 + 1,
                life: 60
            });
        }
    }

    function update() {
        if (!isRunning) return;

        const now = Date.now();
        const currentSpawnInterval = baseSpawnInterval / difficultyMultiplier;
        
        if (now - lastSpawnTime > currentSpawnInterval) {
            const chance = Math.random();
            if (chance > 0.8) {
                createEnemy();
            } else if (chance > 0.6) {
                createPowerUp();
            } else {
                createStar();
            }
            lastSpawnTime = now;
        }

        const dx = mousePos.x - player.x;
        const dy = mousePos.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 1) {
            player.velX = (dx / distance) * 50;
            player.velY = (dy / distance) * 50;
        } else {
            player.velX = 0;
            player.velY = 0;
        }
        player.x += player.velX;
        player.y += player.velY;

        if (player.x < player.size) player.x = player.size;
        if (player.x > canvas.width - player.size) player.x = canvas.width - player.size;
        if (player.y < player.size) player.y = player.size;
        if (player.y > canvas.height - player.size) player.y = canvas.height - player.size;

        if (player.shieldTimer > 0) {
            player.shieldTimer--;
            if (player.shieldTimer <= 0) {
                player.shielded = false;
            }
        }

        enemies = enemies.filter(enemy => {
            enemy.x += enemy.velX;
            enemy.y += enemy.velY;
            const dist = Math.sqrt(Math.pow(player.x - enemy.x, 2) + Math.pow(player.y - enemy.y, 2));
            if (dist < player.size + enemy.size) {
                if (player.shielded) {
                    createParticles(enemy.x, enemy.y, enemy.color, 20);
                    return false;
                } else {
                    gameOver();
                }
            }
            return enemy.x > -enemy.size && enemy.x < canvas.width + enemy.size && enemy.y > -enemy.size && enemy.y < canvas.height + enemy.size;
        });

        stars = stars.filter(star => {
            star.x += star.velX;
            star.y += star.velY;
            const dist = Math.sqrt(Math.pow(player.x - star.x, 2) + Math.pow(player.y - star.y, 2));
            if (dist < player.size + star.size) {
                score++;
                scoreElement.textContent = score;
                createParticles(star.x, star.y, star.color, 15);
                if (score % 10 === 0) {
                    difficultyMultiplier += 0.2;
                }
                return false;
            }
            return star.x > -star.size && star.x < canvas.width + star.size && star.y > -star.size && star.y < canvas.height + star.size;
        });

        powerUps = powerUps.filter(powerUp => {
            powerUp.x += powerUp.velX;
            powerUp.y += powerUp.velY;
            const dist = Math.sqrt(Math.pow(player.x - powerUp.x, 2) + Math.pow(player.y - powerUp.y, 2));
            if (dist < player.size + powerUp.size) {
                player.shielded = true;
                player.shieldTimer = 300;
                createParticles(powerUp.x, powerUp.y, powerUp.color, 30);
                return false;
            }
            return powerUp.x > -powerUp.size && powerUp.x < canvas.width + powerUp.size && powerUp.y > -powerUp.size && powerUp.y < canvas.height + powerUp.size;
        });

        particles = particles.filter(p => {
            p.x += p.velX;
            p.y += p.velY;
            p.life--;
            return p.life > 0;
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (isRunning) { // Only draw the player if the game is running
            ctx.fillStyle = player.color;
            ctx.beginPath();
            ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
            ctx.fill();

            if (player.shielded) {
                ctx.strokeStyle = '#33ff33';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(player.x, player.y, player.size + 5, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        
        enemies.forEach(enemy => {
            ctx.fillStyle = enemy.color;
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
            ctx.fill();
        });

        stars.forEach(star => {
            ctx.fillStyle = star.color;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });

        powerUps.forEach(powerUp => {
            ctx.fillStyle = powerUp.color;
            ctx.beginPath();
            ctx.arc(powerUp.x, powerUp.y, powerUp.size, 0, Math.PI * 2);
            ctx.fill();
        });

        particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function loop() {
        update();
        draw();
        requestAnimationFrame(loop);
    }

    function gameOver() {
        if (!isRunning) return; // Prevent multiple calls
        
        isRunning = false;
        createParticles(player.x, player.y, player.color, 50); // Create a large player explosion
        finalScoreElement.textContent = score;

        // Display end screen after a short delay to see the explosion
        setTimeout(() => {
            endScreen.style.display = 'flex';
        }, 500); 
    }

    function restartGame() {
        isRunning = true;
        score = 0;
        difficultyMultiplier = 1;
        scoreElement.textContent = 0;
        enemies = [];
        stars = [];
        powerUps = [];
        particles = [];
        player.shielded = false;
        player.shieldTimer = 0;
        lastSpawnTime = Date.now();
        endScreen.style.display = 'none';
        setCanvasSize();
        loop();
    }

    restartGame();
});
