"use strict"

exports = module.exports = (function(){

    /**
     * 
     * DEPENDENCIES
     * 
     */

    const chalk = require("chalk");

    // const PokerEvaluator = (require("poker-evaluator-ts")).PokerEvaluator;
    const EvalHand = require("./evalHand.js");

    const Player = require("./player.js");
    const Deck = require("./deck.js");
    const CONFIG = require("./config.json");

    // Used for checking approximate equality
    const EPSILON = 0.001;

    /**
     * 
     * INITIALIZATION
     * 
     */

    /**
     * The constructor for the Game itself
     */
    const Game = function(){
        // console.log("\nInitializing New Game");

        this._players = [];
        this._cardDeck = new Deck();

        this._dealerIndex = 0;
        this._communityCards = [];
        this._pot = 0;
        this._currentBet = 0;

        this._totalMoney = 0;
        this._handsPlayed = 0;

        // this._evaluator = new PokerEvaluator();

        Object.seal(this);
    };

    Game.prototype.CurrentBet = function(){ return this._currentBet; };
    Game.prototype.CommunityCards = function(){ return this._communityCards; };
    Game.prototype.Players = function() { return this._players.map(x => x); };
    Game.prototype.HandsPlayed = function() { return this._handsPlayed; };

    /**
     * 
     * PLAYERS - ADDING AND REMOVING
     * 
     */

    /**
     * Checks whether an input param is a Player object
     * @param {Object} input The object to check if it's of type Player
     */
    const CheckPlayer = function(input){
        let result = input instanceof Player;
        if(result === false)
            console.log(chalk.redBright(input + " is not an object of type Player"));
        return result;
    };

    /**
     * Adds a new player to the game
     * @param {Object} newPlayer The player object to add
     */
    Game.prototype.PlayerAdd = function(newPlayer){
        if(!CheckPlayer(newPlayer)) return;
        // console.log("Adding player: " + newPlayer);
        this._players.push(newPlayer);
        // console.log("Updated Players: " + this._players);

        this._totalMoney += newPlayer.Funds();
        // console.log("Total money at the table is now $" + this._totalMoney);
    };

    /**
     * Removes a player from the game
     * @param {Object} outPlayer The player object to remove
     */
    Game.prototype.PlayerRemove = function(outPlayer){
        if(!CheckPlayer(newPlayer)) return;
        console.log("Removing player: " + outPlayer);
        let playerIndex = this._players.indexOf(outPlayer);
        this._players.splice(playerIndex, 1);
        console.log("Remaining Players: " + this._players);
    };

    /**
     * 
     * GAMEPLAY
     * 
     */

    /**
     * Starts a new hand
     * Returns whether game is over
     */
    Game.prototype.NewHand = function(){

        console.log("\n\n\nStarting new hand");

        this._handsPlayed++;

        // console.log("Clearing community cards");
        this._communityCards = [];

        // console.log("Reshuffling Deck");
        this._cardDeck.Reshuffle();

        console.log("\nDealing Hole Cards:");
        for(let player of this._players){
            player.NewHand();
            player.RemoveHand();
            let newHand = [];
            for(let n = 0; n < CONFIG.hand.holeCards; ++n)
                newHand.push(this._cardDeck.Draw());
            player.SetHand(newHand);
            console.log(` - ${player.toString()}: ${newHand}`);
        }

        // console.log("Incrementing dealer");
        this._dealerIndex++;
        this._dealerIndex %= this._players.length;

        let startPlayerIndex = this._dealerIndex;

        // Sets everyone up for new betting rounds
        for(let player of this._players){
            player.NewBettingRound();
        }

        console.log("");

        // First, the small blind
        startPlayerIndex++;
        startPlayerIndex %= this._players.length;
        this._players[startPlayerIndex].BetBlind(CONFIG.betting.smallBlind);
        console.log(this._players[startPlayerIndex] + " bet the small blind, $" + this._players[startPlayerIndex].CurrentBet());
        // Notes who did the small blind - they start the betting in subsequent rounds
        let smallBlindPlayerIndex = startPlayerIndex;
        

        // Second, the big blind
        startPlayerIndex++;
        startPlayerIndex %= this._players.length;
        this._players[startPlayerIndex].BetBlind(CONFIG.betting.bigBlind);
        console.log(this._players[startPlayerIndex] + " bet the big blind, $" + this._players[startPlayerIndex].CurrentBet());
        // Notes who did the big blind - they get a final check
        let bigBlindPlayerIndex = startPlayerIndex;

        // Sets up our big blind as our current bet
        this._currentBet = CONFIG.betting.bigBlind;

        // Increment to next player who will start actual betting
        startPlayerIndex++;
        startPlayerIndex %= this._players.length;

        // Start the betting round
        BettingRound.call(this, startPlayerIndex, true);

        // let bigBlindPlayer = this._players[bigBlindPlayerIndex];
        // // If no one raised
        // if(this._currentBet === CONFIG.betting.bigBlind){
        //     console.log(`Giving big blind player ${bigBlindPlayer.toString()} chance to check or raise`);
        //     let bbFinalBet = bigBlindPlayer.Bet(this);
        //     if(bbFinalBet > CONFIG.betting.bigBlind){
        //         console.log(`Big blind player ${bigBlindPlayer} raised, so we do another round of betting`);
        //         BettingRound.call(this, bigBlindPlayerIndex + 1);
        //     } else {
        //         console.log(`Big blind player ${bigBlindPlayer} checked`);
        //     }
        // } else {
        //     console.log(`Not giving big blind player ${bigBlindPlayer.toString()} chance to check or raise`);
        // }

        // console.log("Collecting bets");
        for(let player of this._players){
            this._pot += player.SubmitCurrentBet();
        }
        // console.log(`Current pot: $${this._pot}`);

        CheckPot.call(this);
        CheckCurrentBalances.call(this);
        CheckTotalMoney.call(this);


        console.log("\nDealing the flop...");
        for(let n = 0; n < 3; ++n){
            this._communityCards.push(this._cardDeck.Draw());
        }
        console.log(this._communityCards);

        // console.log("Starting Betting Round 2");
        // Sets everyone up for new betting rounds
        for(let player of this._players){
            player.NewBettingRound();
        }
        this._currentBet = 0;
        BettingRound.call(this, smallBlindPlayerIndex);
        // console.log("Collecting bets");
        for(let player of this._players){
            this._pot += player.SubmitCurrentBet();
        }
        // console.log(`Current pot: $${this._pot}`);

        CheckPot.call(this);
        CheckCurrentBalances.call(this);
        CheckTotalMoney.call(this);

        console.log("\nDealing the turn...");
        this._communityCards.push(this._cardDeck.Draw());
        console.log(this._communityCards);

        // console.log("Starting Betting Round 3");
        // Sets everyone up for new betting rounds
        for(let player of this._players){
            player.NewBettingRound();
        }
        this._currentBet = 0;
        BettingRound.call(this, smallBlindPlayerIndex);
        // console.log("Collecting bets");
        for(let player of this._players){
            this._pot += player.SubmitCurrentBet();
        }
        // console.log(`Current pot: $${this._pot}`);

        CheckPot.call(this);
        CheckCurrentBalances.call(this);
        CheckTotalMoney.call(this);

        console.log("\nDealing the river...");
        this._communityCards.push(this._cardDeck.Draw());
        console.log(this._communityCards);

        // console.log("Starting Betting Round 4");
        // Sets everyone up for new betting rounds
        for(let player of this._players){
            player.NewBettingRound();
        }
        this._currentBet = 0;
        BettingRound.call(this, smallBlindPlayerIndex);
        // console.log("Collecting bets");
        for(let player of this._players){
            this._pot += player.SubmitCurrentBet();
        }
        
        DistributeWinnings(this._players, this._communityCards, this._pot);

        // console.log("Emptying pot");
        this._pot = 0;

        CheckPot.call(this);
        CheckCurrentBalances.call(this);

        let bustedOut = [];
        // console.log("\nCurrent Balances:");
        for(let player of this._players){
            // console.log(` - ${player.toString()}:`.padEnd(20) + `$${player.Funds()}`);
            if(player.Funds() === 0){
                bustedOut.push(player);
            }
            else if(player.Funds() < 0){
                throw new Error(`${player.toString()} has $${player.Funds()}!`);
            }
        }

        for(let player of bustedOut){
            console.log(`${player.toString()} has BUSTED OUT!`);
            this._players.splice(this._players.indexOf(player), 1);
        }

        CheckTotalMoney.call(this);

        // console.log("Remaining Players:");
        // for(let player of this._players){
        //     console.log(" - " + player.toString());
        // }

        if(this._players.length === 0){
            throw new Error("How did we manage to end with no players???");
        }
        else if(this._players.length === 1){
            console.log(`${this._players[0].toString()} is the winner!`);
            return true;
        }

        // CheckTotalMoney.call(this);
        // CheckCurrentBalances.call(this);

        return false;
    };

    const CheckTotalMoney = function(){
        // Check if the money everyone has still adds up!
        // Starts at 0
        let totalMoney = 0;

        // Adds the current pot
        totalMoney += this._pot;

        //Add player funds
        for(let player of this._players)
            totalMoney += player.Funds();

        // If we have a difference greater than a ny floating point rounding error
        if(Math.abs(totalMoney - this._totalMoney) > EPSILON){
            // We throw an error
            throw new Error(`$${totalMoney - this._totalMoney} extra dollars at the table! (Hand ${this._handsPlayed})`);
        }
    };

    const CheckCurrentBalances = function(){
        console.log("\nCurrent Balances:");
        for(let player of this._players){
            console.log(` - ${player.toString()}:`.padEnd(20) + `$${player.Funds()}`);
        }
    };

    const CheckPot = function(){
        console.log("\nCurrent Pot:".padEnd(20) + `$${this._pot}`);
    };

    const BettingRound = function(startPlayerIndex /*, isBlinds = false*/ ){

        // let loopLength = this._players.length;

        // if(bigBlindPlayer > -1){
        //     console.log("If there are no raises, big blind player gets ");
        // }

        // console.log("Starting the betting round");
        for(let indexOffset = 0; indexOffset < this._players.length; ++indexOffset){
            // Gets our current player index
            let currentIndex = (startPlayerIndex + indexOffset) % this._players.length;
            // Gets our current player from the index
            let currentPlayer = this._players[currentIndex];
            // Has the player bet
            let bet = currentPlayer.Bet(this);
            if(bet > this._currentBet){
                // Set the new bet
                this._currentBet = bet;
                // Reset our loop
                // New start index
                startPlayerIndex = currentIndex;
                // Reset offset index
                indexOffset = 0;
                // // In the case where we were going to let 
                // let loopLength = this._players.length;
            }

            // If they bet less than the bet
            if(bet + EPSILON < this._currentBet && 
                // But also less than their current funds
                bet + EPSILON < currentPlayer.Funds() &&
                // And they haven't folded
                !currentPlayer.HasFolded()
                ){
                // That's not valid betting
                throw new Error(`${currentPlayer.toString()} only bet $${bet} when the bet was $${this._currentBet} and their funds were $${currentPlayer.Funds()}`);
            }
        }

        // Lets everyone know about everyone's bets
        // Used for tracking max possible winnings, and therefore side pots
        let playerBets = [];
        for(let player of this._players){
            playerBets.push(player.CurrentBet());
        }
        for(let player of this._players){
            player.AddEveryonesBets(playerBets);
        }
    };


    const DistributeWinnings = function(allPlayers, communityCards, pot){

        console.log("");

        let potAmounts = [];

        for(let player of allPlayers){

            // Makes sure only non-folding players are part of this
            if(player.HasFolded()) {
                console.log(`${player.toString()} has folded and is not eligible for any winnings`);
                continue;
            }

            // Adds the amt the player are eligible for to the array of possibilities
            // Usually, this array will only hold one value - everyone bet the same
            // (And anyone who folded hasn't made it this far in the code)
            // Sometimes people will go all in,
            // so we'll have multiple values and resulting side pots
            if(!potAmounts.includes(player.MaxEligiblePot())){
                potAmounts.push(player.MaxEligiblePot());
                console.log(`Adding $${player.MaxEligiblePot()} to eligible pots`);
            }

        }

        // Sorts our pot amounts in ascending order
        potAmounts.sort(function(a,b){
            return parseInt(a) - parseInt(b);
        });
        console.log(`Sorted pots: ${potAmounts}`);

        // Keeps track of how much money we've removed from the pot thus far
        let amountTakenFromPot = 0;
        // Goes through each pot
        for(let pot of potAmounts){
            
            console.log(`\nFinding winner for $${pot - amountTakenFromPot} pot`);

            // Only allows eligible players to partake in the pot
            let eligiblePlayers = [];
            for(let player of allPlayers){
                if(player.MaxEligiblePot() >= pot){
                    // console.log(` - ${player.toString()} ($${player.MaxEligiblePot()} max) is eligible`);
                    eligiblePlayers.push(player);
                } else {
                    // console.log(` - ${player.toString()} ($${player.MaxEligiblePot()} max) is NOT eligible`);
                }
            }

            // Removes previously rewarded money from this sum
            // So that we aren't making money out of thin air
            pot -= amountTakenFromPot;
            // console.log(`Remaining pot: $${pot}`);

            // Setting player as an array
            // because there may be more than one with the same hand
            let winningPlayers = [];
            let winningValue = 0;
            let winningHand = "";
            for(let player of allPlayers){
                let evaluation = EvalHand(
                    player.Hand(),
                    communityCards
                    );
                if(evaluation.value > winningValue){
                    winningValue = evaluation.value;
                    winningPlayers = [ player ];
                    winningHand = evaluation.handName;
                }
                
                // If we have two people with the same hand
                // we add the second one to the existing array
                else if(evaluation.value === winningValue){
                    winningPlayers.push(player);
                }

                console.log(`${player} has a \"${evaluation.handName}\"`);
            }
            if(winningPlayers.length === 0){
                throw new Error("No winning players!");
            }

            if(winningPlayers.length > 1){
                console.log(`Tie! Winners are ${winningPlayers}`);
            }

            let money = pot / winningPlayers.length;
            for(let winner of winningPlayers){
                console.log(`${winner} wins $${money}`);
                winner.AddFunds(money);
            }

            // Updates the amount taken from the pot
            // So that we aren't making money out of thin air
            amountTakenFromPot += pot;
            console.log(`Amount taken from pot thus far: ${amountTakenFromPot}`);
        }
    };



    /**
     * How many player currently playing
     */
    Game.prototype.PlayerCount = function(){ return this._players.length; };

    return Game;

})();