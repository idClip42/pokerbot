"use strict"

exports = module.exports = (function(){

    // const PokerEvaluator = require("poker-evaluator-ts").PokerEvaluator;
    const EvaluateWinProbability = require("./winProbability.js");

    /**
     * A new player
     * @param {string} uid The name of the player
     * @param {float} funds How much money they have
     */
    const Player = function(uid, funds){
        console.log("Initializing new player: " + uid);

        this._uid = uid;
        this._funds = funds;
        this._hand = [];
        this._currentBet = 0;
        this._totalHandBet = 0;
        this._folded = false;
        this._allIn = false;

        // this._evaluator = new PokerEvaluator();

        Object.seal(this);
    };

    Player.prototype.HasFolded = function(){ return this._folded; };
    Player.prototype.IsAllIn = function(){ return this._allIn; };
    Player.prototype.CurrentBet = function(){ return this._currentBet; };
    Player.prototype.TotalHandBet = function(){ return this._totalHandBet; };
    Player.prototype.Hand = function(){ return this._hand; };
    Player.prototype.Funds = function(){ return this._funds; };

    /**
     * Gives the player some money
     * @param {int} amt How much money to give
     */
    Player.prototype.AddFunds = function(amt){
        console.log(this._uid + " gains $" + amt);
        this._funds += amt;
    };

    /**
     * Takes some money from the player
     * @param {int} amt How much money to take
     */
    Player.prototype.RemoveFunds = function(amt){
        console.log(this._uid + " loses $" + amt);
        this._funds -= amt;
    };

    /**
     * Gives the player some cards
     * @param {array} cards Array of card objects
     */
    Player.prototype.SetHand = function(cards){
        console.log(`${this._uid} got new hole cards`);
        console.log(cards);
        this._hand = cards;
    };

    /**
     * Removes cards from the players hand
     */
    Player.prototype.RemoveHand = function(){
        console.log(`${this._uid}'s hand removed.`);
        this._hand = [];
    };

    Player.prototype.NewHand = function(){
        this._hand = [];
        this._folded = false;
        this._allIn = false;
        this._totalHandBet = 0;
        console.log(`${this._uid} is starting a new hand`);
    };

    Player.prototype.NewBettingRound = function(){
        this._currentBet = 0;
        console.log(`${this._uid} is starting a new betting round`);
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
        console.log(`${this._uid} is betting the blind $${this._currentBet}`);
    };

    /**
     * Logic for how the player bets
     * Returns the bet the player makes
     * @param {object} game The current state of the game
     */
    Player.prototype.Bet = function(game){

        if(!game) throw new Error("Didn't pass in game object");

        console.log(`${this._uid}'s turn to bet`);
        if(this._folded === true) {
            console.log(`${this._uid} already folded`);
            return;
        }
        if(this._funds === 0) {
            this._allIn = true;
        }
        if(this._allIn === true) {
            console.log(`${this._uid} is already all in`);
            return;
        }

        let activePlayerCount = 0;
        for(let player of game.Players()){
            if(player.HasFolded()) continue;
            activePlayerCount++;
        }
        
        let winPerc = EvaluateWinProbability(
            this._hand,
            game.CommunityCards(),
            activePlayerCount
        );

        console.log(`${this._uid} is betting...`);

        this._currentBet = Math.min(game.CurrentBet(), this._funds);
        console.log(`${this._uid} bets $${this._currentBet}`);
        return this._currentBet;
    };

    /**
     * Returns the player's current bet
     */
    Player.prototype.SubmitCurrentBet = function(){
        this._funds -= this._currentBet;
        if(this._funds === 0) this._allIn = true;
        console.log(`${this._uid} is moving $${this._currentBet} into the pot`);
        this._totalHandBet += this._currentBet;
        console.log(`${this._uid} has bet $${this._totalHandBet} this hand`);
        return this._currentBet;
    };

    Player.prototype.toString = function(){
        return this._uid;
    };

    return Player;

})();