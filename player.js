"use strict"

exports = module.exports = (function(){

    const EvaluateWinProbability = require("./winProbability.js");
    const Logic = require("./logic.js");
    const Log = require("./logs.js");

    /**
     * A new player
     * @param {string} uid The name of the player
     * @param {float} funds How much money they have
     */
    const Player = function(uid, funds){
        Log("Initializing new player: " + uid + ", $" + funds);

        this._uid = uid;
        this._funds = funds;
        this._hand = [];
        this._currentBet = 0;
        this._totalHandBet = 0;
        this._folded = false;
        this._allIn = false;
        this._maxEligiblePot = 0;

        this._logic = new Logic();
        this._logic.SetRandomLogic();

        Object.seal(this);
    };

    Player.prototype.HasFolded = function(){ return this._folded; };
    Player.prototype.IsAllIn = function(){ return this._allIn; };
    Player.prototype.CurrentBet = function(){ return this._currentBet; };
    Player.prototype.TotalHandBet = function(){ return this._totalHandBet; };
    Player.prototype.Hand = function(){ return this._hand; };
    Player.prototype.Funds = function(){ return this._funds; };
    Player.prototype.MaxEligiblePot = function(){ return this._maxEligiblePot; };
    Player.prototype.Logic = function(){ return this._logic; };

    /**
     * Gives the player some money
     * @param {int} amt How much money to give
     */
    Player.prototype.AddFunds = function(amt){
        // Log(this._uid + " gains $" + amt);
        this._funds += amt;
    };

    /**
     * Takes some money from the player
     * @param {int} amt How much money to take
     */
    Player.prototype.RemoveFunds = function(amt){
        // Log(this._uid + " loses $" + amt);
        this._funds -= amt;
    };

    /**
     * Gives the player some cards
     * @param {array} cards Array of card objects
     */
    Player.prototype.SetHand = function(cards){
        // Log(`${this._uid} got new hole cards: ${cards}`);
        // Log(" - ");
        this._hand = cards;
    };

    /**
     * Removes cards from the players hand
     */
    Player.prototype.RemoveHand = function(){
        // Log(`${this._uid}'s hand removed.`);
        this._hand = [];
    };

    Player.prototype.NewHand = function(){
        this._hand = [];
        this._folded = false;
        this._allIn = false;
        this._totalHandBet = 0;
        this._maxEligiblePot = 0;
        // Log(`${this._uid} is starting a new hand`);
    };

    Player.prototype.NewBettingRound = function(){
        this._currentBet = 0;
        // Log(`${this._uid} is starting a new betting round`);
    };

    /**
     * Forces a bet from the player
     * @param {int} blind How much to make the player bet
     */
    Player.prototype.BetBlind = function(blind){
        if(blind >= this._funds){
            this._currentBet = this._funds;
            this._allIn = true;
        } else {
            this._currentBet = blind;
        }
        Log(`${this._uid} is betting the blind $${this._currentBet}`);
    };

    /**
     * Logic for how the player bets
     * Returns the bet the player makes
     * @param {object} game The current state of the game
     */
    Player.prototype.Bet = function(game){

        if(!game) throw new Error("Didn't pass in game object");

        // Log(`${this._uid}'s turn to bet`);
        if(this._folded === true) {
            Log(`${this._uid} already folded`);
            return this._currentBet;
        }
        if(this._funds === 0) {
            this._allIn = true;
        }
        if(this._allIn === true) {
            Log(`${this._uid} is already all in`);
            return this._currentBet;
        }

        let activePlayerCount = 0;
        for(let player of game.Players()){
            if(player.HasFolded()) continue;
            activePlayerCount++;
        }
        
        // Gets our win likelihood
        Log(`\n${this._uid} evaluating likelihood of victory:`);
        let winPerc = EvaluateWinProbability(
            this._hand,
            game.CommunityCards(),
            activePlayerCount
        );

        // Gets our ideal bet that we would want with this hand
        let idealBet = this._logic.HowMuchShouldIBet(
            game.CommunityCards().length,
            winPerc
        );

        // Lowers it to our max funds if needed
        let realBet = Math.min(idealBet, this._funds);

        Log(`${this._uid}'s ideal bet is $${realBet}, and the current bet is $${game.CurrentBet()}`);

        // If the current bet is higher than what we want to bet
        if(realBet < game.CurrentBet()){

            // If there's more in the game bet than we have bet so far
            // We are folding
            if(game.CurrentBet() > this._currentBet){
                this._folded = true;
                Log(`${this._uid} folds`);
            }
            // We want to bet nothing
            realBet = 0;
        }

        // If our bet is equal to our funds
        // We're going all in
        if(realBet === this._funds){
            this._allIn = true;
            Log(`${this._uid} goes all-in`);
        }

        // Sets our current bet officially
        this._currentBet = Math.max(this._currentBet, realBet);

        Log(`${this._uid} bets $${this._currentBet}`);
        return this._currentBet;
    };

    /**
     * Returns the player's current bet
     */
    Player.prototype.SubmitCurrentBet = function(){
        this._funds -= this._currentBet;
        if(this._funds === 0) this._allIn = true;
        // Log(`${this._uid} is moving $${this._currentBet} into the pot`);
        this._totalHandBet += this._currentBet;
        // Log(`${this._uid} has bet $${this._totalHandBet} this hand`);
        return this._currentBet;
    };

    Player.prototype.AddEveryonesBets = function(betsArray){

        // TODO: This doesn't work for the extended first round of betting

        // If we folded, we're not eligible for anything
        if(this._folded){
            this._maxEligiblePot = 0;
            return;
        }

        // For each bet placed this round
        for(let bet of betsArray){
            // Adds either the bet the other person made to our max eligible money
            // or only the amt we put in (if we went all-in)
            this._maxEligiblePot += Math.min(this._currentBet, bet);
        }

    };

    Player.prototype.toString = function(){
        return this._uid;
    };

    return Player;

})();