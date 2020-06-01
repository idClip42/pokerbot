exports = module.exports = (function(){

    const fs = require("fs");
    const path = require("path");

    const stats = require("stats-lite");

    const FILENAME = "statsRecord_0.02.json";
    const PATH = path.join(__dirname, FILENAME)

    const MultiplierPercRecord = function(perc){
        this.choiceLikelihood = perc;
        this.games = 0;
        this.wins = 0;
        this.losses = 0;
        this.winPercentage = 0;
        this.winTimes = [];
        Object.seal(this);
    };

    const TableState = function(){
        // Each array:
        // - Index is the blind multiplier
        // - Value is an object
        //   - Keys are percentages
        //   - Values are MultiplierPercRecord object
        this["2Cards"] = [];
        this["5Cards"] = [];
        this["6Cards"] = [];
        this["7Cards"] = [];
        Object.seal(this);
    };

    const Record = function(){
        console.log("Initializing Record");

        // Set of TableStates
        // Keys are player counts
        this.playerCounts = {};

        Object.seal(this);
    };

    Record.prototype.Load = function(){
        console.log("Loading Record");

        if(!fs.existsSync(PATH)){
            console.log("File doesn't exist yet");
            return;
        }

        let dataString = fs.readFileSync(PATH, "utf-8");
        let dataObj = JSON.parse(dataString);

        Object.assign(this, dataObj);
        // console.log(this);
    };

    Record.prototype.Save = function(){
        console.log("Saving Record");

        fs.writeFileSync(
            PATH,
            JSON.stringify(this, null, 4)
        );
    };

    /**
     * Adds info about a player and their game to our records
     * @param {object} logic The Player's logic object
     * @param {number} playerCount How many players in the game
     * @param {boolean} didWin Whether this player won
     */
    Record.prototype.AddPlayerLogicResults = function(logic, playerCount, didWin, gameTime){
        
        if(!this.playerCounts.hasOwnProperty(playerCount))
            this.playerCounts[playerCount] = new TableState();

        let table = this.playerCounts[playerCount];

        for(let tableStateString in logic.bettingLikelihood){
            let relevantMultObjArray = table[tableStateString];
            
            for(let multIndex in logic.bettingLikelihood[tableStateString]){

                if(relevantMultObjArray[multIndex] === undefined){
                    relevantMultObjArray[multIndex] = {};
                }

                percToDataObj = relevantMultObjArray[multIndex];

                // TODO: Sort the percentage keys

                let percentage = logic.bettingLikelihood[tableStateString][multIndex];

                if(!percToDataObj.hasOwnProperty(percentage)){
                    percToDataObj[percentage] = new MultiplierPercRecord(percentage);
                }

                let thisRecord = percToDataObj[percentage];
                thisRecord.games++;
                if(didWin) {
                    thisRecord.wins++;
                    thisRecord.winTimes.push(gameTime);
                }
                else {
                    thisRecord.losses++;
                }
                thisRecord.winPercentage = thisRecord.wins / thisRecord.games;

            }
        }

    };

    Record.prototype.EvaluateBestStrategy = function(){
        // return;
        console.log("Best Strategy found thus far:");

        for(let playerCount in this.playerCounts){
            console.log(" • " + playerCount + " Players");

            for(let cardCount in this.playerCounts[playerCount]){
                console.log("    • " + cardCount);

                let probSet = this.playerCounts[playerCount][cardCount];

                console.log("       • You should multiply the blinds by:");

                let maxPerc = -1;
                let bestStat = undefined;
                for(let mult in probSet){
                    let statSet = probSet[mult];
                    // console.log(statSet);
                    console.log("        • " + mult + "x");
                    for(let winStat in statSet){
                        let winPerc = statSet[winStat].winPercentage
                        if(winPerc > maxPerc){
                            maxPerc = winPerc;
                            bestStat = statSet[winStat];
                        }
                    }
                    if(!bestStat) throw new Error("What up here?");
                    // console.log(bestStat);
                    console.log("          • When you have " + (bestStat.choiceLikelihood * 100) + "% chance of winning");
                    console.log("          • Wins games " + Math.round(bestStat.winPercentage * 100) + "% of the time");
                    console.log(`          • ${bestStat.wins} wins, ${bestStat.losses} losses`);
                    console.log(`          • Time:`);
                    console.log(`            • Mean: ${stats.mean(bestStat.winTimes)}ms`);
                    console.log(`            • Median: ${stats.median(bestStat.winTimes)}ms`);
                    // console.log(`            • Mode: ${stats.mode(bestStat.winTimes)}ms`);
                    console.log(`            • Min: ${Math.min(...bestStat.winTimes)}ms`);
                    console.log(`            • Max: ${Math.max(...bestStat.winTimes)}ms`);
                }
            }
        }
    };

    return Record;

})();