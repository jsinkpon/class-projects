import { isValid } from './scrabbleUtils.js';
import { Game } from './game.js';
import { Rack } from './rack.js';

// this should produce a different sequence each time
let g = new Game();
let r = new Rack();

// YOUR TESTS GO HERE
console.assert(
    isValid("bik") == false,
    'isValid returns wrong result'
);

console.assert(
    isValid("bike") == true,
    'isValid returns wrong result'
);