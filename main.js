"use strict"

const Game = require("./game.js");
const Player = require("./player.js");
const CONFIG = require("./config.json");
const Record = require("./record.js");

const bigIntNsMs = BigInt(1e+6);
// const bigIntMsS = BigInt(1000);

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

const record = new Record();
record.Load();
record.EvaluateBestStrategy();

while(true){

    console.log("\nStarting new game...");

    let players = [];
    for(let name of PLAYER_NAMES){
        players.push(new Player(
            name,
            CONFIG.betting.buyIn
        ));
    }

    let game = new Game();
    for(let player of players)
        game.PlayerAdd(player);

    let startBigInt = process.hrtime.bigint();

    let gameEnded = false;
    while(gameEnded === false){
        gameEnded = game.NewHand();
    }
    console.log("Game is over");
    game.End();

    if(game.Players().length !== 1) throw new Error(`At end of game, player count is ${game.Players().length}`);
    console.log(`Winner: ${game.Players()[0].toString()}`);

    let endBigInt = process.hrtime.bigint();
    let msSpan = (function(){
        let ns = endBigInt - startBigInt;
        return Number(ns / bigIntNsMs);
    })();
    console.log(`Game took ${msSpan}ms`);
    let seconds = Math.round(msSpan / 1000);
    console.log(`Game took ${seconds}s`);
    // const minutes = seconds / 60;
    // console.log(`Game took ${minutes} min`);

    let handsPlayed = game.HandsPlayed();
    console.log("Hands played: " + handsPlayed);

    let handsPerSecond = Math.round(handsPlayed / seconds);
    console.log("Hands per second: " + handsPerSecond);

    for(let player of players){
        let logic = player.Logic();
        let playerCount = players.length;
        let won = (player === game.Players()[0]);
        record.AddPlayerLogicResults(logic, playerCount, won);
    }

    record.EvaluateBestStrategy();

    record.Save();
}