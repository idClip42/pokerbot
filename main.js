"use strict"

const Game = require("./game.js");
const Player = require("./player.js");
const CONFIG = require("./config.json");

const bigIntNsMs = BigInt(1e+6);
const bigIntMsS = BigInt(1000);

// for(let n = 0; n < 5; ++n)
//     console.log("---------------------------------------------------------------------------------------------------------------");
console.log("STARTING POKER RUN");

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

let startBigInt = process.hrtime.bigint();

let gameEnded = false;
while(gameEnded === false){
    gameEnded = game.NewHand();
}
console.log("Game is over");
game.End();

console.log(`Winner: ${game.Players()[0].toString()}`);

let endBigInt = process.hrtime.bigint();
let msSpan = (function(){
    let ns = endBigInt - startBigInt;
    return (ns / bigIntNsMs);
})();
console.log(`Game took ${msSpan}ms`);

const handsPlayed = game.HandsPlayed();
console.log("Hands played: " + handsPlayed);

const seconds = msSpan / bigIntMsS;
const handsPerSecond = handsPlayed / Number(seconds);
console.log("Hands per second: " + handsPerSecond);