//@ts-check

const STONE = "stone";
const PARCHMENT = "parchment";
const SHEARS = "shears";
const STAPLER = "stapler";
const PEN = "pen";
const GUN = "gun";
const WEAPONS = [STONE, PARCHMENT, SHEARS, STAPLER, PEN];

let tieCount = 0;
let winCount = 0;
let lossCount = 0;

let hue = 0;
let playerStats = {
	winMultiplier: 1,
	upgradeCost: 5,
	unlockedOmniStone: false,
	unlockedStapler: false,
	unlockedPen: false,
	permanentAutoClicker: false,
};

/** @type { HTMLElement | null } */
let myElement = document.getElementById("myParagraph");

/** @type { HTMLElement | null } */
let resultsElement = document.getElementById("game-results");
if (resultsElement == null) {
	throw "aftermath is not defined";
}
/**@type {HTMLElement | null } */
const bouncingSquare = document.getElementById("bouncing-square");
if (bouncingSquare == null) {
	throw "bouncing-square is not defined";
}

// Variable to control the animation state
let animationId = null;

// Win conditions object
const winConditions = {
	[STONE]: [SHEARS, STAPLER],
	[PARCHMENT]: [STONE, PEN],
	[SHEARS]: [PARCHMENT, STAPLER],
	[STAPLER]: [PARCHMENT, PEN],
	[PEN]: [STONE, SHEARS],
};

// Upgrade definitions
const upgrades = [
	{
		id: "flash-reduce-1",
		name: "Reduce Flash Risk",
		cost: 5,
		effect: () =>
			(playerStats.upgradeCost = Math.floor(
				playerStats.upgradeCost * 0.8
			)),
	},
	{
		id: "flash-reduce-2",
		name: "Super Reduce",
		cost: 10,
		effect: () =>
			(playerStats.upgradeCost = Math.floor(
				playerStats.upgradeCost * 0.7
			)),
	},
	{
		id: "flash-reduce-3",
		name: "Hyper Reduce",
		cost: 20,
		effect: () =>
			(playerStats.upgradeCost = Math.floor(
				playerStats.upgradeCost * 0.5
			)),
	},
	{
		id: "unlock-stapler",
		name: "Unlock Stapler",
		cost: 30,
		effect: () => {
			playerStats.unlockedStapler = true;
			const button = document.getElementById("stapler-btn");
			if (button) button.style.display = "inline-block";
		},
	},
	{
		id: "unlock-pen",
		name: "Unlock Pen",
		cost: 30,
		effect: () => {
			playerStats.unlockedPen = true;
			const button = document.getElementById("pen-btn");
			if (button) button.style.display = "inline-block";
		},
	},
	{
		id: "gun-unlock",
		name: "Unlock Gun",
		cost: 50,
		effect: () => {
			playerStats.unlockedOmniStone = true;
			const omniStoneBtn = document.getElementById("gun-btn");
			if (omniStoneBtn) {
				omniStoneBtn.style.display = "inline-block";
			}
		},
	},
	{
		id: "permanent-autoclicker",
		name: "Permanent Autoclicker",
		cost: 100,
		effect: () => {
			playerStats.permanentAutoClicker = true;
			const button = document.getElementById("permanent-autoclicker-btn");
			if (button) button.disabled = true;
			startPermanentAutoClicker();
		},
	},
];

// Bouncing square animation
window.onload = function () {
	const bouncingSquare = document.getElementById("bouncing-square");
	if (!bouncingSquare) return;

	// Get viewport dimensions
	let viewportWidth = window.innerWidth;
	let viewportHeight = window.innerHeight;

	// Get square dimensions
	const squareWidth = bouncingSquare.offsetWidth;
	const squareHeight = bouncingSquare.offsetHeight;

	// Set initial position and velocity
	let x = 500;
	let y = 500;
	let dx = Math.floor(Math.random() * 20 + 2); // Velocity in the x-direction
	let dy = dx; // Velocity in the y-direction

	function animateSquare() {
		if (!bouncingSquare) return;

		// Update position
		x += dx;
		y += dy;

		// Collision detection for x-axis
		if (x + squareWidth >= viewportWidth || x <= 0) {
			dx = -dx; // Reverse x-direction
		}

		// Collision detection for y-axis
		if (y + squareHeight >= viewportHeight || y <= 0) {
			dy = -dy; // Reverse y-direction
		}

		// Apply new position
		bouncingSquare.style.left = x + "px";
		bouncingSquare.style.top = y + "px";

		// Recalculate viewport dimensions in case of window resize
		viewportWidth = window.innerWidth;
		viewportHeight = window.innerHeight;

		// Request the next frame
		requestAnimationFrame(animateSquare);
	}

	// Start the animation loop
	animateSquare();

	// Render the upgrade store on load
	renderUpgradeStore();
	if (playerStats.permanentAutoClicker) {
		startPermanentAutoClicker();
	}
};

const pickWeapon = function (playerWeapon) {
	stopFlashing();

	const allButtons = document.querySelectorAll(".game-button");
	allButtons.forEach((btn) => {
		btn.classList.remove("winner", "loser");
	});

	let aftermathText = `The player elected to choose ${playerWeapon}. `;
	console.log("The contender elected to choose", playerWeapon);

	let computerWeapon = selectComputerWeapon();
	console.log("the computer elected to choose", computerWeapon);

	let results = determineOutcome(playerWeapon, computerWeapon);
	console.log("outcome: ", results);

	let winner = "";
	if (results?.isDraw) {
		winner = results.description;
		tieCount += 1;
		console.log(tieCount);
	} else if (results?.playerVictorious) {
		winner = "The player prevails";
		winCount += playerStats.winMultiplier;
		console.log(winCount);
	} else if (results?.computerVictorious) {
		winner = "The computer prevails";
		lossCount += 1;
		console.log(lossCount);
		startFlashing();
	} else {
		winner = "";
	}
	if (resultsElement) {
		resultsElement.textContent =
			aftermathText + `${winner} as ${results?.description}.`;
	}

	const playerButton = document.getElementById(`${playerWeapon}-btn`);
	const computerButton = document.getElementById(`${computerWeapon}-btn`);

	if (results?.playerVictorious) {
		if (playerButton) playerButton.classList.add("winner");
		if (computerButton) computerButton.classList.add("loser");
	} else if (results?.computerVictorious) {
		if (playerButton) playerButton.classList.add("loser");
		if (computerButton) computerButton.classList.add("winner");
	}

	setTimeout(() => {
		if (playerButton) playerButton.classList.remove("winner", "loser");
		if (computerButton) computerButton.classList.remove("winner", "loser");
	}, 1500);

	updateScoreboard();
	renderUpgradeStore();
};

const selectComputerWeapon = function () {
	const availableWeapons = WEAPONS.slice(
		0,
		3 +
			(playerStats.unlockedStapler ? 1 : 0) +
			(playerStats.unlockedPen ? 1 : 0)
	);
	const rand = Math.floor(Math.random() * availableWeapons.length);
	return availableWeapons[rand];
};

function determineOutcome(playerWeapon, computerWeapon) {
	let outcome = {
		isDraw: false,
		playerVictorious: false,
		computerVictorious: false,
		description: "",
	};

	if (playerWeapon === GUN) {
		outcome.playerVictorious = true;
		outcome.description = "The Gun destroys all.";
		return outcome;
	}

	if (playerWeapon === computerWeapon) {
		outcome.isDraw = true;
		outcome.description = "The results of this battle is a draw.";
		return outcome;
	}

	if (winConditions[playerWeapon]?.includes(computerWeapon)) {
		outcome.playerVictorious = true;
		outcome.description = `${playerWeapon} beats ${computerWeapon}.`;
		return outcome;
	} else {
		outcome.computerVictorious = true;
		outcome.description = `${computerWeapon} beats ${playerWeapon}.`;
		return outcome;
	}
}

// Function to update the scoreboard in the HTML
const updateScoreboard = function () {
	/** @type { HTMLElement | null } */
	const winCountElement = document.getElementById("win-count");
	if (winCountElement) {
		winCountElement.textContent = winCount.toString();
	}

	/** @type { HTMLElement | null } */
	const lossCountElement = document.getElementById("loss-count");
	if (lossCountElement) {
		lossCountElement.textContent = lossCount.toString();
	}

	/** @type { HTMLElement | null } */
	const tieCountElement = document.getElementById("tie-count");
	if (tieCountElement) {
		tieCountElement.textContent = tieCount.toString();
	}
};

// Controls the color flashing animation
function updateFrame() {
	if (!bouncingSquare) return;
	// Increment the hue value.
	hue = (hue + 5) % 360;

	// Create the HSL color string.
	const color = `hsl(${hue}, 100%, 50%)`;

	// Apply the new color to both the square and the page background.
	bouncingSquare.style.backgroundColor = color;
	document.body.style.backgroundColor = color;

	// Loop the animation
	animationId = requestAnimationFrame(updateFrame);
}

// Starts the animation
function startFlashing() {
	if (!animationId) {
		updateFrame();
	}
}

// Stops the flashing animation
function stopFlashing() {
	if (animationId) {
		cancelAnimationFrame(animationId);
		animationId = null;
		document.body.style.backgroundColor = ""; // Reset background
	}
}

// Renders the upgrade store based on player wins
function renderUpgradeStore() {
	const upgradeStore = document.getElementById("upgrade-store");
	if (!upgradeStore) return;

	upgradeStore.innerHTML = ""; // Clear existing upgrades

	upgrades.forEach((upgrade) => {
		if (winCount >= upgrade.cost) {
			const button = document.createElement("button");
			button.id = upgrade.id;
			button.textContent = `${upgrade.name} (${upgrade.cost} wins)`;
			button.classList.add("upgrade-button");
			button.disabled =
				playerStats.permanentAutoClicker &&
				upgrade.id === "permanent-autoclicker";

			button.addEventListener("click", () => handleUpgrade(upgrade));
			upgradeStore.appendChild(button);
		}
	});
}

// Handles buying upgrades
function handleUpgrade(upgrade) {
	if (winCount >= upgrade.cost) {
		winCount -= upgrade.cost;
		upgrade.effect();
		updateScoreboard();
		renderUpgradeStore(); // Re-render the store to show new upgrades
	}
}

// Starts the permanent autoclicker
function startPermanentAutoClicker() {
	setInterval(() => {
		pickWeapon(STONE);
	}, 1000); // Clicks the stone button every 1000ms (1 second)
}

// Add event listeners for game buttons
document.addEventListener("DOMContentLoaded", () => {
	const staplerBtn = document.getElementById("stapler-btn");
	if (staplerBtn)
		staplerBtn.addEventListener("click", () => pickWeapon(STAPLER));

	const penBtn = document.getElementById("pen-btn");
	if (penBtn) penBtn.addEventListener("click", () => pickWeapon(PEN));

	const gunBtn = document.getElementById("gun-btn");
	if (gunBtn) gunBtn.addEventListener("click", () => pickWeapon(GUN));

	const stoneBtn = document.getElementById("stone-btn");
	if (stoneBtn) stoneBtn.addEventListener("click", () => pickWeapon(STONE));

	const parchmentBtn = document.getElementById("parchment-btn");
	if (parchmentBtn)
		parchmentBtn.addEventListener("click", () => pickWeapon(PARCHMENT));

	const shearsBtn = document.getElementById("shears-btn");
	if (shearsBtn)
		shearsBtn.addEventListener("click", () => pickWeapon(SHEARS));
});
/**
 * A robust stopwatch timer that updates a specified HTML element.
 * It is wrapped in a DOMContentLoaded listener to ensure the HTML element exists before running.
 */
document.addEventListener("DOMContentLoaded", () => {
	// Attempt to find the timer element.
	const timerElement = document.getElementById("game-timer");
	if (!timerElement) {
		console.error("The timer element with ID 'game-timer' was not found.");
		return; // Exit if the element is not present.
	}

	let seconds = 0;
	let timerInterval;

	/**
	 * The main function that runs every second to update the timer display.
	 */
	const updateGameTimer = () => {
		seconds++;

		// Calculate minutes and remaining seconds for formatting.
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;

		// Add a leading zero if the seconds are less than 10.
		const displaySeconds =
			remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;

		// Update the element's text content.
		timerElement.textContent = `Time: ${minutes}:${displaySeconds}`;
	};

	// Start the timer by calling the update function every 1000 milliseconds (1 second).
	timerInterval = setInterval(updateGameTimer, 1000);
});
