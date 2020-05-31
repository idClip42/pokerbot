exports = module.exports = (function(){
    const CONFIG = require("./config.json");

    // This will be our base value for betting
    const BLIND = CONFIG.betting.bigBlind;

    const Logic = function(){

        console.log("Initializing Logic...");

        // Contains arrays of values
        // Indices are how much to multiply the blind by
        // Values are min percentage needed to place that bet
        this.bettingLikelihood = {
            "2Cards" : [],
            "5Cards" : [],
            "6Cards" : [],
            "7Cards" : []
        }

        Object.seal(this);
    };

    const CheckValidFloat = function(input){
        if(input < 0 || input > 1)
            throw new Error(input + " is invalid!");
    };

    Logic.prototype.HowMuchShouldIBet = function(commCardCount, winProbability){

        CheckValidFloat(winProbability);

        // Gets which logic set to use, based on card count
        let logicSet = undefined;
        switch(commCardCount){
            case 0:
                logicSet = this.bettingLikelihood["2Cards"];
                break;
            case 3:
                logicSet = this.bettingLikelihood["5Cards"];
                break;
            case 4:
                logicSet = this.bettingLikelihood["6Cards"];
                break;
            case 5:
                logicSet = this.bettingLikelihood["7Cards"];
                break;
            default:
                throw new Error(`Received invalid community card count ${commCardCount}`);
                break;
        }

        // Goes down the list of 
        for(let mult = logicSet.length-1; mult >= 0; --mult){
            // We get the min percentage at which to bet with this multiplier
            let percvalue = logicSet[mult];

            // If our current percentage is higher than the min
            if(winProbability >= percvalue){
                // We calculate our bet
                let bet = BLIND * mult;
                // Then we return it
                return bet;
            }
        }

        // If none of them were valid, we return 0
        // Ideally, the 0 spot on each array should be 0, so we never get here
        // But that's a dumb requirement
        return 0;
    };

    Logic.prototype.SetRandomLogic = function(){

        // How many multiples we want of the big blind
        const MAX_MULT = 5;

        // Goes thru each condition/table state/card count
        for(let key in this.bettingLikelihood){

            let set = this.bettingLikelihood[key];

            // We put a zero in the zero spot
            set.push(0);

            let values = [];
            for(let n = 0; n < MAX_MULT; ++n)
                values.push(Math.random());

            values.sort((a,b) => { return a-b; })

            console.log(key + ":");
            console.log(values);
        }
    };

    return Logic;

})();