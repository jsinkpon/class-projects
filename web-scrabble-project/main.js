import { Game } from "./game.js";
import { Rack } from "./rack.js";
import { bestPossibleWords, canConstructWord, constructWord, isValid } from "./scrabbleUtils.js";
const game = new Game();
const rack = new Rack();
game.render(document.getElementById("board"));

if (localStorage.getItem("rack") == null) {
  rack.takeFromBag(7, game);
}
rack.render(document.getElementById('rack'));

document.getElementById("play").addEventListener("click", () => {
  const word = document.getElementById("word").value;
  const x = parseInt(document.getElementById("x").value);
  const y = parseInt(document.getElementById("y").value);
  const direction = document.getElementById("direction").value === "horizontal";
  let available_tiles = rack.getAvailableTiles();
  if (isValid(word) == true){
    if(canConstructWord(available_tiles, word) == true){
      let word_arr = constructWord(available_tiles, word);
      if (game.playAt(word, { x, y }, direction) == -1){
        alert(word + " cannot be played at (" + x + ", " + y + ")");
      }
      else {
        game.playAt(word, { x, y }, direction);
        game.render(document.getElementById("board"));
        for (let i = 0; i < word_arr.length; ++i){
          rack.removeTile(word_arr[i]);
        }
        rack.takeFromBag(word_arr.length, game);
        rack.render(document.getElementById('rack'));
        document.getElementById('random').disabled = false;
      }
    }
    else{
      alert(word + " cannot be formed from the available tiles.");
      return
    }
  }
  else {
    alert( word + " is not a valid word.");
    return;
  }
  
});

document.getElementById('reset').addEventListener('click', function() {
  game.resetState(rack);
})

document.getElementById('help').addEventListener('click', function(){
  let available_tiles = rack.getAvailableTiles();
  let suggestions = bestPossibleWords(available_tiles);
  if (suggestions.length !== 0) {
    let index = Math.floor(Math.random() * suggestions.length);
    document.getElementById('hint').value = suggestions[index].toUpperCase();

  }
  else{
    alert("No words possible with this rack");
  }
});

document.getElementById('random').addEventListener('click', function(){
  let available_tiles = rack.getAvailableTiles();
  let suggestions = bestPossibleWords(available_tiles);
  if (suggestions.length !== 0) {
    let index = Math.floor(Math.random() * suggestions.length);
    let random_word = suggestions[index];
    if (canConstructWord(available_tiles, random_word) == true){
      let word_arr = constructWord(available_tiles, random_word);
      let x_val = Math.floor(Math.random() * 15) + 1;
      let y_val = Math.floor(Math.random() * 15) + 1;
      let orientation =  (Math.round(Math.random) == 1) ? true: false;
      if (game.playAt(random_word,  {x: x_val, y: y_val }, orientation) == -1){
        alert(word + " cannot be played at (" + x_val + ", " + y_val + ")");
      }
      else {
        game.playAt(random_word, {x: x_val, y: y_val}, orientation);
        game.render(document.getElementById("board"));
        for (let i = 0; i < word_arr.length; ++i){
          rack.removeTile(word_arr[i]);
        }
        rack.takeFromBag(word_arr.length, game);
        rack.render(document.getElementById('rack'));
        document.getElementById('random').disabled = true;
      }
    }

  }
  else{
    alert("Computer cannot find a valid word with this rack");
  }
});
