"use strict"

const Game = require("./game.js");
const Player = require("./player.js");
const CONFIG = require("./config.json");

for(let n = 0; n < 5; ++n)
    console.log("---------------------------------------------------------------------------------------------------------------");

const PLAYER_NAMES = [
    "Arty",
    "Barb",
    "Cole",
    "Dirk",
    "Eve"
];

const players = [];
for(let name of PLAYER_NAMES){
    players.push(new Player(
        name,
        CONFIG.betting.buyIn
    ));
}

const game = new Game();
for(let player of players)
    game.PlayerAdd(player);

let gameEnded = false;
while(gameEnded === false){
    gameEnded = game.NewHand();
}
console.log("Game is over");