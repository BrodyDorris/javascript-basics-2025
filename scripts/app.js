// This will be our first javascript file

console.log("greetings world, sincerely: Javascript");

//this is a string varaiable
//strings are surrounded by "", '', or ``.

let username = "Brody";
let favSong = "lkjhgfdsx";

console.log("my name is", username);

favSong = "lkjhgfdiut";

let whatHappens = username + favSong + 1000;

console.log(whatHappens);

let array = ["three", "one", "four", "one", "five", "nine"];
console.log(array, array[5]);

let profile = {
	username: username,
	favGame: "Chess",
	likes: 0,
	subscribers: 0,
	friends: ["Brody", "..."]
};

console.log(profile);
