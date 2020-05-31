"use strict"

exports = module.exports = (function(){

    const process = require("process");

    const CONFIG = require("./config.json");
    const Deck = require("./deck.js");

    // const PokerEvaluator = new (require("poker-evaluator-ts").PokerEvaluator)();
    const EvalHand = require("./evalHand.js");

    const bigIntNsMs = BigInt(1e+6);

    const EvaluateWinProbability = function(holeCards, communityCards, totalActivePlayerCount){
        
        // console.log("\nEvaluating likelihood of victory...");
        console.log(" - Hole Cards: " + holeCards);
        console.log(" - Community Cards: " + communityCards);
        console.log(" - Active Players: " + totalActivePlayerCount);

        // We collect our currently drawn cards
        // so we can omit them from our sim deck
        let cardsToOmit = [];
        for(let card of holeCards)
            cardsToOmit.push(card.id);
        for(let card of communityCards)
            cardsToOmit.push(card.id);

        // We set up our sim deck
        let deck = new Deck(cardsToOmit);

        // We set up our wins and losses
        let wins = 0;
        let losses = 0;

        // console.log("Beginning simulation...");
        let startBigInt = process.hrtime.bigint();


        for(let n = 0; n < CONFIG.logic.evalIterations; ++n){

            // Our sim!

            // Reshuffle the deck
            deck.Reshuffle();

            // We set up a different array for comm cards
            // So that it's fresh every time
            let simCommunityCards = [];

            // We add the existing community cards to this array
            for(let card of communityCards)
                simCommunityCards.push(card);

            // Fill out the community cards
            // Make sure there are 5
            while(simCommunityCards.length < 5){
                simCommunityCards.push(deck.Draw());
            }

            // We learn the value of our hand
            let myEval = EvalHand(holeCards, simCommunityCards).value;

            // Start with assumption that we won
            let won = true;
            for(let n = 0; n < totalActivePlayerCount - 1; ++n){
                // Randomly draws opponent's hand
                let oppHand = [];
                for(let m = 0; m < CONFIG.hand.holeCards; ++m){
                    oppHand.push(deck.Draw());
                }
                // Evaluates opponents hand
                let oppEval = EvalHand(oppHand, simCommunityCards).value;
                // If it's better than ours
                if(oppEval > myEval){
                    // We didn't win
                    won = false;
                    // No need to check others
                    break;
                }
            }

            // Update our win loss counts
            if(won === true)
                wins++;
            else
                losses++;


            // throw "done";

        }


        let endBigInt = process.hrtime.bigint();
        let msSpan = (function(){
            let ns = endBigInt - startBigInt;
            // console.log(`Sim took ${ns}ns`);
            return (ns / bigIntNsMs);
        })();
        console.log("\nSim:");

        console.log(` - ${msSpan}ms`);

        console.log(" - Wins: " + wins);
        console.log(" - Losses: " + losses);

        let winPerc = wins / (wins + losses);
        console.log(" - Win Percentage: " + (winPerc * 100) + "%");

        return winPerc;
    };

    // const EvalHand = function(holeCards, communityCards){

    //     let readableHand = [];
    //     for(let card of holeCards)
    //         readableHand.push(card.id);
    //     for(let card of communityCards)
    //         readableHand.push(card.id);

    //     let score = PokerEvaluator.evalHand(readableHand);
    //     // console.log(score);

    //     return score.value;
    // }

    return EvaluateWinProbability;

})();