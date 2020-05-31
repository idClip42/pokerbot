"use strict"

exports = module.exports = (function(){

    const CardDeck = require("card-deck");
    const Log = require("./logs.js");

    const ranksList = [
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "T",
        "J",
        "Q",
        "K",
        "A"
    ];

    const suitsList = [
        "c",
        "d",
        "h",
        "s"
    ];

    /**
     * Creates a new card with a given suit and rank
     * @param {string} rank The rank of the card, selected from ranksList
     * @param {string} suit The suit of the card, selected from suitssList
     */
    const Card = function(rank, suit){

        if(!ranksList.includes(rank) || 
            !suitsList.includes(suit))
            throw new Error("Invalid card values: " + rank + suit);

        this.rank = rank;
        this.suit = suit;
        this.id = rank + suit;
        Object.freeze();
    };

    Card.prototype.toString = function(){
        return this.id;
    };

    /**
     * Creates a new deck of 52 cards
     * @param {Array} cardIdsToOmit Array of card ids to omit from deck
     */
    const Deck = function(cardIdsToOmit = []){

        // Log("Generating new deck");

        if(cardIdsToOmit.length > 0){
            // Log("Omitting cards: " + cardIdsToOmit);
        }

        this._allCards = [];
        for(let r in ranksList){
            for(let s in suitsList){
                let card = new Card(
                    ranksList[r],
                    suitsList[s]
                );
                // We skip any cards specified as skippable
                if(cardIdsToOmit.includes(card.id)) continue;
                this._allCards.push(card);
            }
        }
        // Log("Generating " + this._allCards.length + " cards");

        this._deckObj = new CardDeck();
        // Log("Deck created");

        Object.freeze();
    };

    /**
     * Reshuffles this deck
     */
    Deck.prototype.Reshuffle = function(){
        // Log("Refilling deck with " + this._allCards.length + " cards");
        // Need to use "map" because the deck removes cards from the array
        this._deckObj.cards(this._allCards.map(x => x));
        // Log("Cards remaining: " + this._deckObj.remaining());
        // Log("Shuffling deck");
        this._deckObj.shuffle();
    };

    /**
     * Draws a card from the deck
     */
    Deck.prototype.Draw = function(){
        // Log("Drawing a card from the deck");
        let drawnCard = this._deckObj.draw();
        if(!drawnCard){
            throw new Error(`Drew ${drawnCard} card!`);
        }
        // Log("Cards remaining: " + this._deckObj.remaining());
        return drawnCard
    };

    return Deck;

})();