const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

let gameRunning = false;
let score = 0;
let screenShrink = 0;
let hitboxesVisible = false;

// --- New laser properties ---
const laser = {
	charging: false,
	charged: false,
	firing: false,
	chargeTime: 20, // Frames to charge
	cooldownTime: 280, // Frames for cooldown
	chargeCounter: 0,
	cooldownCounter: 0,
	chargeCounter: 0,
	beam: null, // Holds the laser beam object
};

// Player settings
const player = {
	x: 50,
	y: canvas.height / 2,
	size: 60,
	speedY: 0,
	gravity: 0.25,
	jumpPower: -6,
	isPressingSpace: false,
	upwardSpeed: -6,
	easingFactor: 0.1,
};

// --- Image loading setup ---
const imagesToLoad = {
	spaceship: "spaceship.webp",
	building_top: "building_top.webp",
	building_bottom: "building_bottom.webp",
	bird: "bird.webp",
	bomb: "bomb.png",
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
			imagesLoadedCount++;
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

function Particle(x, y, color, size, speedX, speedY, life, gravity) {
	this.x = x;
	this.y = y;
	this.size = size || Math.random() * 2 + 1;
	this.speedX = speedX || Math.random() * 10 - 5;
	this.speedY = speedY || Math.random() * 10 - 5;
	this.color = color;
	this.life = life || 120;
	this.gravity = gravity || 0.2;
}

// Bomb spawning
const bombs = []; // Use an array to manage all bombs
let bombSpawnRate = 600; // Time in frames between bomb spawns
let bombSpawnCounter = 0;
const bombSpeed = 8;
const bombSize = 65; // Adjust the size as needed

function createBomb() {
	const y = Math.random() * (canvas.height - bombSize * 2) + bombSize;
	bombs.push({
		x: canvas.width,
		y: y,
		size: bombSize,
		speedX: -bombSpeed - 7,
		image: loadedImages.bomb,
		type: "bomb",
	});
}

Particle.prototype.update = function () {
	this.x += this.speedX;
	this.y += this.speedY;
	this.speedY += this.gravity;
	this.life -= 1;
};

Particle.prototype.draw = function () {
	ctx.fillStyle = this.color;
	ctx.beginPath();
	ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
	ctx.fill();
};

function createParticles(x, y, count, color, size, life, speedSpread, gravity) {
	for (let i = 0; i < count; i++) {
		const speedX = Math.random() * speedSpread - speedSpread / 2;
		const speedY = Math.random() * speedSpread - speedSpread / 2;
		const pSize = size || Math.random() * 2 + 1;
		const pLife = life || 120;
		const pGravity = gravity || 0.2;
		particles.push(
			new Particle(x, y, color, pSize, speedX, speedY, pLife, pGravity)
		);
	}
}

function explode(x, y) {
	// Red explosion fire
	createParticles(x, y, 75, "rgba(255, 100, 0, 0.8)", 6, 90, 10, 0.4);
	// White core sparks
	createParticles(x, y, 50, "rgba(255, 255, 255, 0.9)", 3, 60, 15, 0.2);
	// Smoke
	createParticles(x, y, 30, "rgba(100, 100, 100, 0.5)", 8, 120, 7, 0.2);
}

bomb = loadedImages.bomb;

// Update and draw bomb
if (bomb) {
	bomb.x += bomb.speedX;
	if (loadedImages.bomb) {
		ctx.drawImage(loadedImages.bomb, bomb.x, bomb.y, bomb.size, bomb.size);
	} else {
		// Fallback to drawing a colored circle if image fails to load
		ctx.fillStyle = "#ffff00";
		ctx.beginPath();
		ctx.arc(
			bomb.x + bomb.size / 2,
			bomb.y + bomb.size / 2,
			bomb.size / 2,
			0,
			Math.PI * 2
		);
		ctx.fill();
	}

	// Check for bomb collection
	if (
		(player.x < bomb.x + bomb.size &&
			player.x + player.size > bomb.x &&
			player.y < bomb.y + bomb.size &&
			player.y + player.size > bomb.y) ||
		bomb.y < 0
	) {
		activateBomb();
		score += 10;
	}

	// Remove off-screen bomb
	if (bomb.x + bomb.size < 0) {
		bomb = null;
	}
}

function removeAllObsticles(obstacles) {
	const elementsWithClass = document.querySelectorAll(`.${obstacles}`);
	elementsWithClass.forEach((element) => {
		element.classList.remove(obstacles);
	});
}

function activateBomb() {
	// Clear all obstacles from the screen
	obstacles.length = 0;
	explode(obs.x + obs.width / 2, obs.y + obs.height / 2);
	obstacles.splice(i, 1);

	// Play a large explosion effect at the bomb's location
	explode(bomb.x + bomb.size / 2, bomb.y + bomb.size / 2);

	// Increase the score, or apply other game logic
	score += 50;
	console.log("Bomb collected! The screen is cleared of obstacles.");

	endGame();
}

// screenShake.js
function startScreenShake(targetElement, duration = 400, intensity = 5) {
	let startTime;
	let shakeLoop;

	function animateShake(timestamp) {
		if (!startTime) {
			startTime = timestamp;
		}
		const elapsedTime = timestamp - startTime;
		const progress = Math.min(elapsedTime / duration, 1);
		const easedProgress = 1 - progress;

		const xOffset = (Math.random() - 0.5) * intensity * 2 * easedProgress;
		const yOffset = (Math.random() - 0.5) * intensity * 2 * easedProgress;

		targetElement.style.transform = `translate(${xOffset}px, ${yOffset}px)`;

		if (progress < 1) {
			shakeLoop = requestAnimationFrame(animateShake);
		} else {
			targetElement.style.transform = "translate(0, 0)";
			startTime = null;
			shakeLoop = null;
		}
	}

	// If a shake is already in progress, stop it before starting a new one
	if (shakeLoop) {
		cancelAnimationFrame(shakeLoop);
		targetElement.style.transform = "translate(0, 0)";
	}

	// Start the new animation loop
	shakeLoop = requestAnimationFrame(animateShake);
}

// Obstacle settings
const obstacles = [];
let obstacleSpawnRate = 10;
let obstacleSpawnCounter = 0;
const obstacleSpeed = 10;
const pipeGap = 150;
const pipeWidth = 80;

function createObstacle() {
  const obstacleType = Math.random();
  const planetSize = 150; // Set a specific size for the planet

  if (obstacleType < 0.01) { // 1% chance for a large planet
    obstacles.push({
      x: canvas.width,
      y: Math.random() * (canvas.height - planetSize),
      width: planetSize,
      height: planetSize,
      speedX: -(obstacleSpeed * 0.5), // Planets move slower
      image: loadedImages.planet,
      type: "planet",
    });
  } else if (obstacleType < 0.03) { // 2% chance for buildings (0.01 to 0.03)
    const minGapY = 100;
    const maxGapY = canvas.height - 100 - pipeGap;
    const gapY = Math.random() * (maxGapY - minGapY) + minGapY;
    obstacles.push({
      x: canvas.width,
      y: 0,
      width: pipeWidth,
      height: gapY,
      speedX: -obstacleSpeed,
      image: loadedImages.building_top,
      type: "building",
    });
    obstacles.push({
      x: canvas.width,
      y: gapY + pipeGap,
      width: pipeWidth,
      height: canvas.height - (gapY + pipeGap),
      speedX: -obstacleSpeed,
      image: loadedImages.building_bottom,
      type: "building",
    });
  } else { // All other times, a bird (0.03 to 1.0)
    obstacles.push({
      x: canvas.width + 50,
      y: Math.random() * (canvas.height - 50) + 25,
      width: 40,
      height: 40,
      speedX: -(obstacleSpeed + Math.random() * 3),
      image: loadedImages.bird,
      type: "bird",
    });
  }
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

	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, canvas.width, shrinkOffset);
	ctx.fillRect(0, canvas.height - shrinkOffset, canvas.width, shrinkOffset);
	ctx.fillRect(
		0,
		shrinkOffset,
		shrinkOffset,
		canvas.height - shrinkOffset * 2
	);
	ctx.fillRect(
		canvas.width - shrinkOffset,
		shrinkOffset,
		shrinkOffset,
		canvas.height - shrinkOffset * 2
	);

	if (player.isPressingSpace) {
		player.speedY +=
			(player.upwardSpeed - player.speedY) * player.easingFactor;
		createParticles(
			player.x,
			player.y + player.size / 2,
			1,
			"rgba(255, 218, 7, 0.35)"
		);
	} else {
		player.speedY += player.gravity;
	}

	player.y += player.speedY;

	if (
		player.y + player.size > canvas.height - shrinkOffset ||
		player.y < shrinkOffset
	) {
		endGame();
		setTimeout(() => {
			alert(`Score: ${score}`);
		}, 1000); // 2000 milliseconds = 2 seconds
		return;
	}
	if (
		player.x < shrinkOffset ||
		player.x + player.size > effectiveWidth + shrinkOffset
	) {
		endGame();
		setTimeout(() => {
			alert(`Score: ${score}`);
		}, 1000); // 2000 milliseconds = 2 seconds
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

	// --- Laser charging and firing logic ---
	if (laser.charging) {
		laser.chargeCounter++;
		// Draw the cool pulsing charging effect
		const chargePulse = Math.sin(laser.chargeCounter * 0.2) * 10 + 5;
		const chargeSize =
			(laser.chargeCounter / laser.chargeTime) *
			(player.size + chargePulse);
		const alpha = laser.chargeCounter / laser.chargeTime;

		// Emit charging particles
		createParticles(
			player.x + player.size,
			player.y + player.size / 2,
			2,
			`rgba(255, 100, 100, ${alpha})`,
			Math.random() * 5 + 1,
			30,
			10,
			0
		);

		ctx.save();
		ctx.globalCompositeOperation = "lighter";
		ctx.fillStyle = `rgba(255, 0, 0, ${0.4 * alpha})`;
		ctx.beginPath();
		ctx.arc(
			player.x + player.size,
			player.y + player.size / 2,
			chargeSize,
			0,
			Math.PI * 2
		);
		ctx.fill();
		ctx.restore();

		if (laser.chargeCounter >= laser.chargeTime) {
			laser.charged = true;
		}
	}

	if (laser.firing) {
		laser.beam = {
			x: player.x + player.size,
			y: player.y + player.size / 2 - 10,
			width: canvas.width,
			height: 20,
		};
		if (!laser.beam) {
			laser.beam = {
				x: player.x + player.size,
				y: player.y + player.size / 2 - 10,
				width: canvas.width,
				height: 20,
			};
		}

		// Spawn beam trail particles
		createParticles(
			laser.beam.x,
			laser.beam.y + laser.beam.height / 2,
			5,
			"rgba(255, 255, 255, 0.7)",
			1,
			30,
			8,
			0
		);
		createParticles(
			laser.beam.x,
			laser.beam.y + laser.beam.height / 2,
			3,
			"rgba(255, 100, 100, 0.8)",
			1.5,
			20,
			10,
			0
		);

		// Draw the cool laser beam with a glow effect
		ctx.save();
		ctx.globalCompositeOperation = "lighter";

		// Outer glow
		ctx.shadowColor = "rgba(255, 0, 0, 1)";
		ctx.shadowBlur = 20;
		ctx.fillStyle = "rgba(255, 100, 100, 0.8)";
		ctx.fillRect(
			laser.beam.x,
			laser.beam.y,
			laser.beam.width,
			laser.beam.height
		);

		// Inner white core
		ctx.shadowBlur = 0;
		ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
		ctx.fillRect(
			laser.beam.x,
			laser.beam.y + 5,
			laser.beam.width,
			laser.beam.height - 10
		);

		ctx.restore();
	}
	// --- End laser charging and firing logic ---

	for (let i = obstacles.length - 1; i >= 0; i--) {
		const obs = obstacles[i];
		obs.x += obs.speedX;

		// Draw the obstacle image
		ctx.drawImage(obs.image, obs.x, obs.y, obs.width, obs.height);

		// --- Collision detection for laser and obstacles ---
		if (laser.firing && laser.beam) {
			if (
				laser.beam.x + laser.beam.width > obs.x &&
				laser.beam.x < obs.x + obs.width &&
				laser.beam.y + laser.beam.height > obs.y &&
				laser.beam.y < obs.y + obs.height
			) {
				// Beam hit particles
				createParticles(
					obs.x + obs.width / 2,
					obs.y + obs.height / 2,
					10,
					"rgba(255, 255, 255, 0.9)",
					2,
					15,
					5,
					0
				);

				// Destroy obstacle
				explode(obs.x + obs.width / 2, obs.y + obs.height / 2);
				obstacles.splice(i, 1);
				continue; // Skip the rest of the loop for this obstacle
			}
		}

		//  detection for player and obstacles
		if (
			player.x + player.size - 12 > obs.x &&
			player.x + 12 < obs.x + obs.width &&
			player.y + player.size - 12 > obs.y &&
			player.y + 12 < obs.y + obs.height
		) {
			setTimeout(() => {
				alert(`Score: ${score}`);
			}, 1000); // 2000 milliseconds = 2 seconds
			endGame();
		}

		if (obs.x + obs.width < 0) {
			obstacles.splice(i, 1);
			if (obs.type === "building") {
				score++;
			} else if (obs.type === "bird") {
				score++;
			}
		}
	}

	if (laser.cooldownCounter > 0) {
		laser.cooldownCounter--;
	}

	ctx.save();
	const playerCenterX = player.x + player.size / 2;
	const playerCenterY = player.y + player.size / 2;

	ctx.translate(playerCenterX, playerCenterY);
	const rotationAngle = player.speedY * 0.05;
	ctx.rotate(rotationAngle);
	ctx.drawImage(
		loadedImages.spaceship,
		-player.size / 2,
		-player.size / 2,
		player.size,
		player.size
	);
	ctx.restore();

	if (hitboxesVisible) {
		ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
		ctx.lineWidth = 2;

		ctx.strokeRect(
			player.x + 12,
			player.y + 12,
			player.size - 34,
			player.size - 34
		);

		if (laser.firing && laser.beam) {
			ctx.strokeRect(
				laser.beam.x,
				laser.beam.y,
				laser.beam.width,
				laser.beam.height
			);
		}

		for (let i = 0; i < obstacles.length; i++) {
			const obs = obstacles[i];
			ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
		}
	}

	// --- Draw the cooldown bar ---
	const barWidth = 200;
	const barHeight = 20;
	const barX = canvas.width - barWidth - 20 - shrinkOffset;
	const barY = 20 + shrinkOffset;

	ctx.fillStyle = "#333";
	ctx.fillRect(barX, barY, barWidth, barHeight);
	ctx.strokeStyle = "#fff";
	ctx.strokeRect(barX, barY, barWidth, barHeight);

	let fillPercentage = 0;
	if (laser.cooldownCounter > 0) {
		fillPercentage =
			(laser.cooldownTime - laser.cooldownCounter) / laser.cooldownTime;
		ctx.fillStyle = "rgba(100, 100, 255, 0.8)";
	} else if (laser.charging) {
		fillPercentage = laser.chargeCounter / laser.chargeTime;
		ctx.fillStyle = "rgba(255, 255, 0, 0.8)";
	} else {
		fillPercentage = 1;
		ctx.fillStyle = "rgba(0, 255, 0, 0.8)";
	}

	ctx.fillRect(barX, barY, barWidth * fillPercentage, barHeight);
	ctx.fillStyle = "#fff";
	ctx.font = "14px monospace";
	ctx.fillText("Laser Status", barX + 5, barY + 15);
	// --- End cooldown bar ---

	ctx.fillStyle = "#fff";
	ctx.font = "24px monospace";
	ctx.fillText("Score: " + score, 20 + shrinkOffset, 40 + shrinkOffset);

	// ... in gameLoop() ...

	// --- Bomb spawning and update logic ---
	bombSpawnCounter++;
	if (bombSpawnCounter >= bombSpawnRate) {
		createBomb();
		bombSpawnCounter = 0;
		// (Optional) Decrease bombSpawnRate over time to increase difficulty
		// if (bombSpawnRate > 300) {
		//     bombSpawnRate -= 5;
		// }
	}

	for (let i = bombs.length - 1; i >= 0; i--) {
		const bomb = bombs[i];
		bomb.x += bomb.speedX;

		// Draw the bomb
		if (bomb.image) {
			ctx.drawImage(bomb.image, bomb.x, bomb.y, bomb.size, bomb.size);
		} else {
			// Fallback for image loading failure
			ctx.fillStyle = "#ffff00";
			ctx.beginPath();
			ctx.arc(
				bomb.x + bomb.size / 2,
				bomb.y + bomb.size / 2,
				bomb.size / 2,
				0,
				Math.PI * 2
			);
			ctx.fill();
		}

		// Check for bomb collection (sion with player)
		if (
			player.x < bomb.x + bomb.size &&
			player.x + player.size > bomb.x &&
			player.y < bomb.y + bomb.size &&
			player.y + player.size > bomb.y
		) {
			// Handle bomb collection (e.g., call activateBomb())
			// For example, trigger an explosion and remove the bomb
			explode(bomb.x + bomb.size / 2, bomb.y + bomb.size / 2);
			bombs.splice(i, 1);
			continue; // Skip to the next item
		}

		// Remove off-screen bomb
		if (bomb.x + bomb.size < 0) {
			bombs.splice(i, 1);
		}
	}

	requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
	if (e.code === "Space" && gameRunning) {
		player.isPressingSpace = true;
	}
	if (e.code === "Space" && !gameRunning) {
		window.location.reload();
	}
	if (
		e.code === "KeyX" &&
		gameRunning &&
		laser.cooldownCounter === 0 &&
		!laser.charging &&
		!laser.firing
	) {
		laser.charging = true;
	}
	if (e.code === "KeyH") {
		hitboxesVisible = !hitboxesVisible;
	}
});

document.addEventListener("keyup", (e) => {
	if (e.code === "Space" && gameRunning) {
		player.isPressingSpace = false;
	}

	if (e.code === "KeyX" && gameRunning && laser.charged) {
		laser.charging = false;
		laser.charged = false;
		laser.firing = true;

		// Calculate firing duration based on charge time percentage.
		// For example, 100% charge (laser.chargeTime) gives a 200ms duration.
		// A shorter charge time will result in a shorter firing duration.
		const firingDuration = (laser.chargeCounter / laser.chargeTime) * 200;

		setTimeout(() => {
			laser.firing = false;
			laser.beam = null;
			laser.chargeCounter = 0; // Reset charge counter after firing
			laser.cooldownCounter = laser.cooldownTime;
		}, firingDuration);
	} else if (e.code === "KeyX" && gameRunning) {
		laser.charging = false;
		laser.chargeCounter = 0;
	}
});

let particleAnimationRunning = false;

function endGame() {
	if (!gameRunning) return;
	gameRunning = false;
	particleAnimationRunning = true;

	// Create a large, multi-colored explosion
	explode(player.x + player.size / 2, player.y + player.size / 2);

	particleLoop();

	setTimeout(() => {
		particleAnimationRunning = false;
		ctx.fillStyle = "#fff";
		ctx.font = "40px monospace";
		ctx.textAlign = "center";
		ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2 - 20);
		ctx.font = "20px monospace";
		ctx.fillText(
			"Press Space to Restart",
			canvas.width / 2,
			canvas.height / 2 + 30
		);
	}, 1000);
}

// Separate loop for particles after game over
function particleLoop() {
	if (!particleAnimationRunning) return;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (let i = particles.length - 1; i >= 0; i--) {
		const p = particles[i];
		p.update();
		p.draw();
		if (p.life <= 0) {
			particles.splice(i, 1);
		}
	}
	// Remove the old incomplete bomb logic from the gameLoop()

	// The bomb collection logic in your gameLoop() function should look like this.
	// Note the changes: it passes the specific `bomb` object to `activateBomb()`.
	// This ensures `activateBomb` knows where the explosion should happen.
	for (let i = bombs.length - 1; i >= 0; i--) {
		const bomb = bombs[i];
		bomb.x += bomb.speedX;

		// Draw the bomb
		if (bomb.image) {
			ctx.drawImage(bomb.image, bomb.x, bomb.y, bomb.size, bomb.size);
		} else {
			ctx.fillStyle = "#ffff00";
			ctx.beginPath();
			ctx.arc(
				bomb.x + bomb.size / 2,
				bomb.y + bomb.size / 2,
				bomb.size / 2,
				0,
				Math.PI * 2
			);
			ctx.fill();
		}

		// Check for bomb collection (collision with player)
		if (
			player.x < bomb.x + bomb.size &&
			player.x + player.size > bomb.x &&
			player.y < bomb.y + bomb.size &&
			player.y + player.size > bomb.y
		) {
			Window.close();
			// Pass the bomb object to the function
			activateBomb(bomb);
			bombs.splice(i, 1); // Remove the collected bomb
			continue;
		}

		// Remove off-screen bomb
		if (bomb.x + bomb.size < 0) {
			bombs.splice(i, 1);
		}
	}

	// --- Create a new, updated activateBomb() function ---
	// This function accepts the bomb object as an argument.
	function activateBomb(collectedBomb) {
		// Clear all obstacles from the screen
		obstacles.length = 0;

		// Create a large explosion at the location of the collected bomb
		// The `explode` function was already defined in your code
		explode(
			collectedBomb.x + collectedBomb.size / 2,
			collectedBomb.y + collectedBomb.size / 2
		);

		// Increase the score, or apply other game logic
		score += 50;
		console.log("Bomb collected! The screen is cleared of obstacles.");
	}

	// ... (rest of your gameLoop code) ...

	requestAnimationFrame(particleLoop);
}

setInterval(createBomb, 3000);
