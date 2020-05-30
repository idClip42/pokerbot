exports = module.exports = (function(){

    const PokerEvaluator = new (require("poker-evaluator-ts").PokerEvaluator)();

    const EvalHand = function(holeCards, communityCards){

        let readableHand = [];
        for(let card of holeCards)
            readableHand.push(card.id);
        for(let card of communityCards)
            readableHand.push(card.id);

        let score = PokerEvaluator.evalHand(readableHand);
        // console.log(score);

        return score;
    }

    return EvalHand;
})();