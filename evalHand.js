exports = module.exports = (function(){

    const PokerEvaluator = new (require("poker-evaluator-ts").PokerEvaluator)();
    const Log = require("./logs.js");

    const EvalHand = function(holeCards, communityCards){

        let readableHand = [];
        for(let card of holeCards)
            readableHand.push(card.id);
        for(let card of communityCards)
            readableHand.push(card.id);

        let score = PokerEvaluator.evalHand(readableHand);
        // Log(score);

        return score;
    }

    return EvalHand;
})();