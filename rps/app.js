//@ts-check

const STONE = "stone";
const PARCHMENT = "parchment";
const SHEARS = "shears";
var win = 0;

let resultsElement = document.getElementById("game-results");

const pickWeapon = function(weapon) {
	console.log("The contender elected to choose", weapon);
	selectComputerWeapon();
	determineOutcome();
	
	let computerWeapon = selectComputerWeapon();
	console.log(computerWeapon);
};


const selectComputerWeapon = function() {
	const rand = Math.floor(Math.random() * 3);

	if (rand == 0) {
		return STONE;
	}

	if (rand == 1) {
		return PARCHMENT;
	}

	return SHEARS;
};

function determineOutcome(playerWeapon, computerWeapon) {
	let outcome = {
		isDraw: false,
		playerVictorious: false,
		description: "",
	};

	if (playerWeapon == computerWeapon) {
		outcome.isDraw = true;
		outcome.description = "The results of this battle is a draw.";
		return outcome;
	}

	if (playerWeapon == STONE && computerWeapon == SHEARS) {
		outcome.playerVictorious = true;
		outcome.description = "Stone is victorious, Shears have been demolished.";
		return outcome;
	}

	if (playerWeapon == STONE && computerWeapon == PARCHMENT) {
		outcome.playerVictorious = false;
		outcome.description = "Stone is not victorious, Stone has been demolished.";
		return outcome;
	}

	if (playerWeapon == PARCHMENT && computerWeapon == SHEARS) {
		outcome.playerVictorious = false;
		outcome.description = "Parchment is not victorious, Parchment has been demolished.";
		return outcome;
	}

	if (playerWeapon == PARCHMENT && computerWeapon == STONE) {
		outcome.playerVictorious = true;
		outcome.description = "Parchment is victorious, Stone has been demolished.";
		return outcome;
	}

	if (playerWeapon == SHEARS && computerWeapon == PARCHMENT) {
		outcome.playerVictorious = true;
		outcome.description = "Shears are victorious, Parchment has been demolished.";
		return outcome;
	}

	if (playerWeapon == SHEARS && computerWeapon == STONE) {
		outcome.playerVictorious = false;
		outcome.description = "Shears are not victorious, Shears has been demolished.";
		return outcome;
	}

	console.log(outcome);
}