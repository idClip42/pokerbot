exports = module.exports = (function(){

    const fs = require("fs");

    const Record = function(){
        console.log("Initializing Record");

        Object.seal(this);
    };

    Record.prototype.Load = function(){
        console.log("Loading Record");

    };

    Record.prototype.Save = function(){
        console.log("Saving Record");

    };

    /**
     * Adds info about a player and their game to our records
     * @param {object} logic The Player's logic object
     * @param {number} playerCount How many players in the game
     * @param {boolean} didWin Whether this player won
     */
    Record.prototype.AddPlayerLogicResults = function(logic, playerCount,didWin ){
        
    };

    return Record;

})();