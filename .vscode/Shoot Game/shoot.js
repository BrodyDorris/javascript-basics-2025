const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

let gameRunning = false;
let score = 0;
let screenShrink = 0;

// Player settings
const player = {
    x: 50,
    y: canvas.height / 2,
    size: 40,
    speedY: 0,
    gravity: 1.2,
    jumpPower: -12,
    isPressingSpace: false,
    upwardSpeed: -12,
    easingFactor: 0.1
};

// --- Image loading setup ---
const imagesToLoad = {
    spaceship: 'spaceship.webp',
    building_top: 'building_top.webp',
    building_bottom: 'building_bottom.webp',
    bird: 'bird.webp',
};
const loadedImages = {};
let imagesLoadedCount = 0;
const totalImages = Object.keys(imagesToLoad).length;

function imageLoader() {
    for (const key in imagesToLoad) {
        const img = new Image();
        img.onload = () => {
            imagesLoadedCount++;
            if (imagesLoadedCount >= totalImages) {
                gameRunning = true;
                gameLoop();
            }
        };
        img.onerror = () => {
            console.error(`Failed to load ${imagesToLoad[key]}.`);
            imagesLoadedCount++; // Still increment to prevent blocking
            if (imagesLoadedCount >= totalImages) {
                gameRunning = true;
                gameLoop();
            }
        };
        img.src = imagesToLoad[key];
        loadedImages[key] = img;
    }
}
imageLoader();
// --- End image loading setup ---

// Particle system
const particles = [];

function Particle(x, y, color) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 5 + 1; // Larger initial size
    this.speedX = (Math.random() * 10 - 5); // Wider spread
    this.speedY = (Math.random() * 10 - 5); // Wider spread
    this.color = color;
    this.life = 120; // Longer life for particles
    this.gravity = 0.2;
}

Particle.prototype.update = function() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += this.gravity; // Gravity to pull particles downwards
    this.life -= 1;
};

Particle.prototype.draw = function() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
};

function createParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

// Obstacle settings
const obstacles = [];
let obstacleSpawnRate = 60; // Spawn more frequently for a mix of obstacles
let obstacleSpawnCounter = 0;
const obstacleSpeed = 5;
const pipeGap = 150; // Distance between the top and bottom pipes
const pipeWidth = 80;

function createObstacle() {
    const obstacleType = Math.random();

    if (obstacleType < 0.7) { // 70% chance to spawn a building pair
        const minGapY = 100;
        const maxGapY = canvas.height - 100 - pipeGap;
        const gapY = Math.random() * (maxGapY - minGapY) + minGapY;

        // Top building
        obstacles.push({
            x: canvas.width,
            y: 0,
            width: pipeWidth,
            height: gapY,
            speedX: -obstacleSpeed,
            image: loadedImages.building_top,
            type: 'building'
        });

        // Bottom building
        obstacles.push({
            x: canvas.width,
            y: gapY + pipeGap,
            width: pipeWidth,
            height: canvas.height - (gapY + pipeGap),
            speedX: -obstacleSpeed,
            image: loadedImages.building_bottom,
            type: 'building'
        });
    } else { // 30% chance to spawn a bird
        obstacles.push({
            x: canvas.width + 50,
            y: Math.random() * (canvas.height - 50) + 25,
            width: 50,
            height: 50,
            speedX: -(obstacleSpeed + Math.random() * 3),
            image: loadedImages.bird,
            type: 'bird'
        });
    }
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    screenShrink += 0.02;
    const shrinkOffset = Math.floor(screenShrink);
    const effectiveWidth = canvas.width - shrinkOffset * 2;
    const effectiveHeight = canvas.height - shrinkOffset * 2;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, shrinkOffset);
    ctx.fillRect(0, canvas.height - shrinkOffset, canvas.width, shrinkOffset);
    ctx.fillRect(0, shrinkOffset, shrinkOffset, canvas.height - shrinkOffset * 2);
    ctx.fillRect(canvas.width - shrinkOffset, shrinkOffset, shrinkOffset, canvas.height - shrinkOffset * 2);

    if (player.isPressingSpace) {
        player.speedY += (player.upwardSpeed - player.speedY) * player.easingFactor;
        createParticles(player.x + player.size / 2, player.y + player.size, 1, 'rgba(4, 0, 255, 0.35)');
    } else {
        player.speedY += player.gravity;
    }

    player.y += player.speedY;

    if (player.y + player.size > canvas.height - shrinkOffset || player.y < shrinkOffset) {
        endGame();
        return;
    }
    if (player.x < shrinkOffset || player.x + player.size > effectiveWidth + shrinkOffset) {
        endGame();
        return;
    }

    obstacleSpawnCounter++;
    if (obstacleSpawnCounter >= obstacleSpawnRate) {
        createObstacle();
        obstacleSpawnCounter = 0;
        if (obstacleSpawnRate > 30) {
            obstacleSpawnRate -= 0.5;
        }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }

    for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
        obs.x += obs.speedX;

        // Draw the obstacle image
        ctx.drawImage(obs.image, obs.x, obs.y, obs.width, obs.height);
        
        // Collision detection for buildings and birds
        if (
            player.x + player.size > obs.x &&
            player.x < obs.x + obs.width &&
            player.y + player.size > obs.y &&
            player.y < obs.y + obs.height
        ) {
            endGame();
        }

        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
            i--;
            // Increment score only for the first obstacle in a pair of buildings
            if (obs.type === 'building' && i % 2 === 0) {
                score++;
            } else if (obs.type === 'bird') {
                score++;
            }
        }
    }

    ctx.save();
    const playerCenterX = player.x + player.size / 2;
    const playerCenterY = player.y + player.size / 2;

    ctx.translate(playerCenterX, playerCenterY);
    const rotationAngle = player.speedY * 0.05;
    ctx.rotate(rotationAngle);
    ctx.drawImage(loadedImages.spaceship, -player.size / 2, -player.size / 2, player.size, player.size);

    ctx.restore();

    ctx.fillStyle = '#fff';
    ctx.font = '24px monospace';
    ctx.fillText('Score: ' + score, 20 + shrinkOffset, 40 + shrinkOffset);

    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameRunning) {
        player.isPressingSpace = true;
    }
    if (e.code === 'Space' && !gameRunning) {
        window.location.reload();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'Space' && gameRunning) {
        player.isPressingSpace = false;
    }
});

// New state variable to control the particle animation after game over
let particleAnimationRunning = false;

// Function to end the game and start the explosion animation
function endGame() {
    if (!gameRunning) return;
    gameRunning = false;
    particleAnimationRunning = true;

    // Create a large, multi-colored explosion with more particles and a wider spread
    createParticles(player.x + player.size / 2, player.y + player.size / 2, 100, 'rgba(255, 100, 0, 0.8)'); // Orange/Red for explosion fire
    createParticles(player.x + player.size / 2, player.y + player.size / 2, 75, 'rgba(255, 255, 255, 0.6)'); // White for sparks
    createParticles(player.x + player.size / 2, player.y + player.size / 2, 50, 'rgba(100, 100, 100, 0.5)'); // Gray for smoke

    // Start the separate particle loop
    particleLoop();
    
    // Use setTimeout to delay the game-over message, allowing the explosion to be visible
    setTimeout(() => {
        particleAnimationRunning = false; // Stop the particle loop after the delay
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#fff';
        ctx.font = '48px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('You have become deceased!', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px monospace';
        ctx.fillText('Final Score: ' + score, canvas.width / 2, canvas.height / 2 + 50);
    }, 1500); // 1.5 second delay for the full animation
}

// New particle-specific loop to run after the game ends
function particleLoop() {
    if (!particleAnimationRunning) return;
    
    // Clear only the particle portion of the screen
    // This is optional and might look better clearing the full screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw all the non-moving elements like the screen borders
    const shrinkOffset = Math.floor(screenShrink);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, shrinkOffset);
    ctx.fillRect(0, canvas.height - shrinkOffset, canvas.width, shrinkOffset);
    ctx.fillRect(0, shrinkOffset, shrinkOffset, canvas.height - shrinkOffset * 2);
    ctx.fillRect(canvas.width - shrinkOffset, shrinkOffset, shrinkOffset, canvas.height - shrinkOffset * 2);

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }

    // Continue the particle loop until the flag is false
    requestAnimationFrame(particleLoop);
}
