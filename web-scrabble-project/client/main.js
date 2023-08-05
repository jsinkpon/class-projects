import { Game } from './game.js';
import { multiPlayerView, getPlayerName } from './multiplayer.js';
import { Rack } from './rack.js';
import * as utils from './scrabbleUtils.js';
import {
  wordScoreBoard,
  gameScoreBoard,
  topWordAndGameScoreBoard,
} from './scoreboard.js';

// UI Components
//  - We grab the DOM elements we need to work with to make our code cleaner.
const boardGridElement = document.getElementById('board');
const playersElement = document.getElementById('players');
const wordElement = document.getElementById('word');
const xElement = document.getElementById('x');
const yElement = document.getElementById('y');
const directionElement = document.getElementById('direction');
const playButtonElement = document.getElementById('play');
const resetButtonElement = document.getElementById('reset');
const helpButtonElement = document.getElementById('help');
const hintElement = document.getElementById('hint');
const endElement = document.getElementById('end');
const top10ScoreBoardElement = document.getElementById('top-10-score-board');

// Useful constants
const TILE_COUNT = 7;
const NUMBER_OF_PLAYERS = 2;

// Keeps track of scores
const scores = Array.from(Array(NUMBER_OF_PLAYERS), () => 0);

// A function to setup multiple racks for a multi-player game.
const setUpRacks = (game, tileCount, numberOfPlayers) => {
  const racks = [];
  for (let i = 0; i < numberOfPlayers; i++) {
    const rack = new Rack();
    rack.takeFromBag(tileCount, game);
    racks[i] = rack;
  }
  return racks;
};

// A utility function to keep a circular counter.
const circularCounter = (end) => {
  let current = 0;
  return () => {
    current = (current + 1) % end;
    return current;
  };
};

// Create and render the game.
const game = new Game();
game.render(boardGridElement);


// We initialize the database so that a previous game data 
// does not interfere with the current game data
const response = await fetch('/init', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
});

if (response.ok){
  alert("Server and database have been started and initialized !");
}

// Create the racks.
const racks = setUpRacks(game, TILE_COUNT, NUMBER_OF_PLAYERS);
let nextTurn = circularCounter(NUMBER_OF_PLAYERS);
let turn = 0;

// Create and render the multiplayer view and racks.
multiPlayerView(playersElement, racks, turn);

// This is what happens when we click the play button.
playButtonElement.addEventListener('click', async () => {
  // Get the values from the UI elements.
  const word = wordElement.value;
  const x = parseInt(xElement.value);
  const y = parseInt(yElement.value);
  const direction = directionElement.value === 'horizontal';

  // Used to record the score of the current move.
  let score = 0;

  // Get the available tiles from the player's rack
  const tiles = racks[turn].getAvailableTiles();

  // Here we define some helper functions to make our code more readable.
  // Checks if the word is valid / not valid
  const wordIsValid = (w) =>
    utils.canConstructWord(tiles, w) && utils.isValid(w);

  const wordIsNotValid = (w) => !wordIsValid(w);

  const playAt = (rw, { x, y }, d) => {
    score = game.playAt(rw, { x, y }, d);
    if (score !== -1) {
      scores[turn] += score;
    }
  };

  // Determines if a play of the word w with direction d is successful.
  const playFails = (w, d) => {
    const rw = utils.constructWord(tiles, w).join('');
    return playAt(rw, { x, y }, d) === -1;
  };

  // Now, we actually try to play the word if it is valid.
  if (wordIsNotValid(word)) {
    alert(`The word ${word} cannot be constructed.`);
  } else if (wordIsValid(word) && playFails(word, direction)) {
    alert(`The word ${word} cannot be played at that location.`);
  } else {
    // The play was successful! Let's update the UI.

    // Rerender the board.
    game.render(boardGridElement);

    // Update the player's rack by removing the used tiles.
    const used = utils.constructWord(tiles, word);
    used.forEach((tile) => racks[turn].removeTile(tile));

    // Take more tiles from the bag to fill the rack.
    racks[turn].takeFromBag(used.length, game);

    // Save and display the word score.
    // TODO #12: Save the word score and render it to the UI
    const word_score_board_element = document.getElementById('word-score-board');
    const cur_player_name = getPlayerName(turn);
    const cur_player_score = score;
    await wordScoreBoard.saveWordScore(cur_player_name, word, cur_player_score);
    wordScoreBoard.render(word_score_board_element);

    // Update the UI for the next player and rerender the players.
    turn = nextTurn();
    multiPlayerView(playersElement, racks, turn);

    // Clear out UI elements for the next play.
    wordElement.value = '';
    xElement.value = '';
    yElement.value = '';
    hintElement.innerHTML = '';
  }
});

// This is what happens when we click the reset button.
resetButtonElement.addEventListener('click', () => {
  // Reset the game board.
  game.reset();
  game.render(boardGridElement);

  // Reset the racks.
  racks.forEach((rack) => rack.reset());
  racks.forEach((rack) => rack.takeFromBag(TILE_COUNT, game));

  // Reset the turn and next turn counter function.
  nextTurn = circularCounter(racks.length);
  turn = 0;

  // Reset the multiplayer view.
  multiPlayerView(playersElement, racks, turn, true);
});

// This is what happens when we click the help button.
helpButtonElement.addEventListener('click', () => {
  const tiles = racks[turn].getAvailableTiles();
  const possibilities = utils.bestPossibleWords(tiles);
  const hint =
    possibilities.length === 0
      ? 'no words!'
      : possibilities[Math.floor(Math.random() * possibilities.length)];
  hintElement.innerText = hint;
});

// TODO #13: Handle a click event when "End" button is clicked

endElement.addEventListener('click', async function(event){
  for (let i = 1; i <= NUMBER_OF_PLAYERS; ++i){
    const cur_player_name = getPlayerName(i - 1);
    await gameScoreBoard.saveGameScore(cur_player_name, scores[i - 1]);
    scores[i - 1] = 0;
  }
  await topWordAndGameScoreBoard.render(top10ScoreBoardElement);
});