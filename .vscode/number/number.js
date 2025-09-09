function generateRandomFiveDigitNumber() {
  // The smallest 5-digit number is 10000.
  const min = 10000;
  // The largest 5-digit number is 99999.
  const max = 99999;

  // Math.random() generates a floating-point number between 0 (inclusive) and 1 (exclusive).
  // Multiplying by (max - min + 1) scales this to the desired range size.
  // Adding min shifts the range to start from the correct minimum value.
  // Math.floor() rounds the result down to the nearest whole number, ensuring an integer.
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Example usage:
const randomNumber = generateRandomFiveDigitNumber();
console.log(randomNumber);