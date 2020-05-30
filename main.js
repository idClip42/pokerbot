"use strict"

const Game = require("./game.js");
const Player = require("./player.js");
const CONFIG = require("./config.json");

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

console.log("Players:");
console.log(players);

const game = new Game();
for(let player of players)
    game.PlayerAdd(player);

game.NewHand();