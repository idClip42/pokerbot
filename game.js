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

    /**
     * 
     * INITIALIZATION
     * 
     */

    /**
     * The constructor for the Game itself
     */
    const Game = function(){
        console.log("Initializing New Game");

        this._players = [];
        this._cardDeck = new Deck();

        this._dealerIndex = 0;
        this._communityCards = [];
        this._pot = 0;
        this._currentBet = 0;

        // this._evaluator = new PokerEvaluator();

        Object.seal(this);
    };

    Game.prototype.CurrentBet = function(){ return this._currentBet; };
    Game.prototype.CommunityCards = function(){ return this._communityCards; };
    Game.prototype.Players = function() { return this._players.map(x => x); };

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
        console.log("Adding player: " + newPlayer);
        this._players.push(newPlayer);
        console.log("Updated Players: " + this._players);
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

        console.log("Starting new hand");

        console.log("Clearing community cards");
        this._communityCards = [];

        console.log("Reshuffling Deck");
        this._cardDeck.Reshuffle();

        console.log("Dealing hole cards");
        for(let player of this._players){
            player.RemoveHand();
            let newHand = [];
            for(let n = 0; n < CONFIG.hand.holeCards; ++n)
                newHand.push(this._cardDeck.Draw());
            player.SetHand(newHand);
        }

        console.log("Incrementing dealer");
        this._dealerIndex++;
        this._dealerIndex %= this._players.length;

        let startPlayerIndex = this._dealerIndex;

        // Sets everyone up for new betting rounds
        for(let player of this._players){
            player.NewBettingRound();
        }

        // First, the small blind
        startPlayerIndex++;
        startPlayerIndex %= this._players.length;
        this._players[startPlayerIndex].BetBlind(CONFIG.betting.smallBlind);
        console.log(this._players[startPlayerIndex] + " bet the small blind, " + this._players[startPlayerIndex].CurrentBet());
        // Notes who did the small blind - they start the betting in subsequent rounds
        let smallBlindPlayerIndex = startPlayerIndex;
        

        // Second, the big blind
        startPlayerIndex++;
        startPlayerIndex %= this._players.length;
        this._players[startPlayerIndex].BetBlind(CONFIG.betting.bigBlind);
        console.log(this._players[startPlayerIndex] + " bet the big blind, " + this._players[startPlayerIndex].CurrentBet());
        // Notes who did the big blind - they get a final check
        let  bigBlindPlayerIndex = startPlayerIndex;

        // Sets up our big blind as our current bet
        this._currentBet = CONFIG.betting.bigBlind;

        // Increment to next player who will start actual betting
        startPlayerIndex++;
        startPlayerIndex %= this._players.length;

        // Start the betting round
        BettingRound.call(this, startPlayerIndex);

        let bigBlindPlayer = this._players[bigBlindPlayerIndex];
        // If no one raised
        if(this._currentBet === CONFIG.betting.bigBlind){
            console.log(`Giving big blind player ${bigBlindPlayer.toString()} chance to check or raise`);
            let bbFinalBet = bigBlindPlayer.Bet(this);
            if(bbFinalBet > CONFIG.betting.bigBlind){
                console.log(`Big blind player ${bigBlindPlayer} raised, so we do another round of betting`);
                BettingRound.call(this, bigBlindPlayerIndex + 1);
            } else {
                console.log(`Big blind player ${bigBlindPlayer} checked`);
            }
        } else {
            console.log(`Not giving big blind player ${bigBlindPlayer.toString()} chance to check or raise`);
        }

        console.log("Collecting bets");
        for(let player of this._players){
            this._pot += player.SubmitCurrentBet();
        }
        console.log(`Current pot: $${this._pot}`);


        console.log("Dealing the flop...");
        for(let n = 0; n < 3; ++n){
            this._communityCards.push(this._cardDeck.Draw());
        }
        console.log(this._communityCards);

        console.log("Starting Betting Round 2");
        // Sets everyone up for new betting rounds
        for(let player of this._players){
            player.NewBettingRound();
        }
        this._currentBet = 0;
        BettingRound.call(this, smallBlindPlayerIndex);
        console.log("Collecting bets");
        for(let player of this._players){
            this._pot += player.SubmitCurrentBet();
        }
        console.log(`Current pot: $${this._pot}`);

        console.log("Dealing the turn...");
        this._communityCards.push(this._cardDeck.Draw());
        console.log(this._communityCards);

        console.log("Starting Betting Round 3");
        // Sets everyone up for new betting rounds
        for(let player of this._players){
            player.NewBettingRound();
        }
        this._currentBet = 0;
        BettingRound.call(this, smallBlindPlayerIndex);
        console.log("Collecting bets");
        for(let player of this._players){
            this._pot += player.SubmitCurrentBet();
        }
        console.log(`Current pot: $${this._pot}`);

        console.log("Dealing the river...");
        this._communityCards.push(this._cardDeck.Draw());
        console.log(this._communityCards);

        console.log("Starting Betting Round 4");
        // Sets everyone up for new betting rounds
        for(let player of this._players){
            player.NewBettingRound();
        }
        this._currentBet = 0;
        BettingRound.call(this, smallBlindPlayerIndex);
        console.log("Collecting bets");
        for(let player of this._players){
            this._pot += player.SubmitCurrentBet();
        }
        console.log(`Current pot: $${this._pot}`);

        let winningPlayer = undefined;
        let winningValue = 0;
        let winningHand = "";

        for(let player of this._players){
            let evaluation = EvalHand(
                player.Hand(),
                this._communityCards
                );

            if(evaluation.value > winningValue){
                winningValue = evaluation.value;
                winningPlayer = player;
                winningHand = evaluation.handName;
            }
        }

        if(!winningPlayer){
            throw new Error("Winning player is somehow " + winningPlayer);
        }

        console.log(`The winner is... ${winningPlayer.toString()}!`);
        console.log(`${winningPlayer.toString()} wins $${this._pot}`);

        console.log(`Transferring pot to ${winningPlayer.toString()}`)
        winningPlayer.AddFunds(this._pot);

        console.log("Emptying pot");
        this._pot = 0;

        let bustedOut = [];
        console.log("Current Balances:");
        for(let player of this._players){
            console.log(`${player.toString()}:\t$${player.Funds()}`);
            if(player.Funds() <= 0){
                bustedOut.push(player);
            }
        }

        for(let player in bustedOut){
            console.log(`${player.toString()} has BUSTED OUT!`);
            this._players.splice(this._players.indexOf(player), 1);
        }

        console.log("Remaining Players:");
        for(let player of this._players){
            console.log(" - " + player.toString());
        }

        if(this._players.length === 0){
            throw new Error("How did we manage to end with no players???");
        }
        else if(this._players.length === 1){
            console.log(`${this._players[0].toString()} is the winner!`);
            return true;
        }
        return false;
    };

    const BettingRound = function(startPlayerIndex){
        console.log("Starting the betting round");
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
            }
        }
    };



    /**
     * How many player currently playing
     */
    Game.prototype.PlayerCount = function(){ return this._players.length; };

    return Game;

})();