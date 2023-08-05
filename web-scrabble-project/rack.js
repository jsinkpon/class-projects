export class Rack {
  constructor() {
    if (localStorage.getItem("rack") !== null) {
      this.available = JSON.parse(localStorage.getItem("rack"));
    }
    else {
      this.available = {};
    }
  }

  /**
   * Returns an object of available tiles mapped to their amount.
   *
   * @returns {Object<string, number>} An object describing the tiles available
   * in this rack.
   */
  getAvailableTiles() {
    return this.available;
  }

  removeTile(letter){
    if(this.available.hasOwnProperty(letter)){
      --this.available[letter];
      if (this.available[letter] == 0){
        delete this.available[letter];
      }
      this.render(document.getElementById('rack'));
    }
    else {
      alert(letter + " is not in the rack");
    }
  }

  render(element){
    element.innerHTML = '';
    let availableTiles_arr = Object.entries(this.available);
    let rack_string = "";
    for (let i = 0; i < availableTiles_arr.length; ++i){
      for (let j = 0; j < availableTiles_arr[i][1]; ++j){
        rack_string += availableTiles_arr[i][0];
      }
    }
    for (let i = 0; i < 7; ++i){
      const newDiv = document.createElement('div');
      newDiv.classList.add("rack-item");
      newDiv.textContent = rack_string[i];
      element.appendChild(newDiv);
    }
  }

  resetRack(game){
    this.available = {};
    this.takeFromBag(7, game);
    this.render(document.getElementById('rack'));
  }

  /**
   * This function will draw n tiles from the game's bag. If there are not
   * enough tiles in the bag, this should take all the remaining ones.
   *
   * @param {number} n The number of tiles to take from the bag.
   * @param {Game} game The game whose bag to take the tiles from.
   */
  takeFromBag(n, game) {
    for (let tile of game.takeFromBag(n)) {
      if (tile in this.available) {
        ++this.available[tile];
      } else {
        this.available[tile] = 1;
      }
    }
    document.getElementById('tiles-count').value = game.getNumTilesLeft();
    localStorage.setItem("rack", JSON.stringify(this.available));
  }
}
