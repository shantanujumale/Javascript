// Rock-Paper-Scissors Game

function playGame(userChoice) {
  const choices = ["rock", "paper", "scissors"];
  
  // Computer randomly selects
  const computerChoice = choices[Math.floor(Math.random() * 3)];
  
  console.log("You chose: " + userChoice);
  console.log("Computer chose: " + computerChoice);

  // Decide winner
  if (userChoice === computerChoice) {
    console.log("It's a tie!");
  } else if (
    (userChoice === "rock" && computerChoice === "scissors") ||
    (userChoice === "paper" && computerChoice === "rock") ||
    (userChoice === "scissors" && computerChoice === "paper")
  ) {
    console.log("You win!");
  } else {
    console.log("Computer wins!");
  }
}

// Example runs
playGame("rock");
playGame("paper");
playGame("scissors");
