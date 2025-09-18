//@ts-check

const STONE = "stone";
const PARCHMENT = "parchment";
const SHEARS = "shears";

let tieCount = 0;
let winCount = 0;
let lossCount = 0;

/** @type { HTMLElement } */
//@ts-ignore checking for null below
let resultsElement = document.getElementById("game-results");
if (resultsElement == null) {
	throw "aftermath is not defined";
}

const pickWeapon = function (weapon) {
	let aftermathText = `The player elected to choose ${weapon}. `;
	console.log("The contender elected to choose", weapon);

	let computerWeapon = selectComputerWeapon();
	console.log("the computer elected to choose", computerWeapon);

	let results = determineOutcome(weapon, computerWeapon);
	console.log("outcome: ", results);

	let winner = "";
	if (results?.isDraw) {
		winner = results.description;
		tieCount += 1;
		console.log(tieCount);
	} else if (results?.playerVictorious) {
		winner = "The player prevails";
		winCount += 1;
		console.log(winCount);
	} else {
		winner = "The computer prevails";
		lossCount += 1;
		console.log(lossCount);
	}
	aftermathText += `${winner} as ${results?.description}.`;

	resultsElement.textContent = aftermathText;
};

const selectComputerWeapon = function () {
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
		outcome.description = "the results of this battle is a draw.";
		return outcome;
	}

	if (playerWeapon == STONE && computerWeapon == SHEARS) {
		outcome.playerVictorious = true;
		outcome.description =
			"Shears do not triumph; Stone eradicated Shears in this contest.";
		return outcome;
	}

	if (playerWeapon == STONE && computerWeapon == PARCHMENT) {
		outcome.playerVictorious = false;
		outcome.description =
			"Stone does not triumph; Parchment eradicated Stone in this contest.";
		return outcome;
	}

	if (playerWeapon == PARCHMENT && computerWeapon == SHEARS) {
		outcome.playerVictorious = false;
		outcome.description =
			"Parchment does not triumph; Shears eradicated Parchment in this contest.";
		return outcome;
	}

	if (playerWeapon == PARCHMENT && computerWeapon == STONE) {
		outcome.playerVictorious = true;
		outcome.description =
			"Stone does not triumph; Parchment eradicated Stone in this contest.";
		return outcome;
	}

	if (playerWeapon == SHEARS && computerWeapon == PARCHMENT) {
		outcome.playerVictorious = true;
		outcome.description =
			"Parchment not triumph; Shears eradicated Parchment in this contest.";
		return outcome;
	}

	if (playerWeapon == SHEARS && computerWeapon == STONE) {
		outcome.playerVictorious = false;
		outcome.description =
			"Shears do not triumph; Stone eradicated Shears in this contest.";
		return outcome;
	}

	console.log(outcome);
}
