// Define the card class.
class Card {
    constructor(type, amount, frontImgSrc, backImgSrc) {
        this.type = type;
        this.amount = amount;
        this.frontImgSrc = frontImgSrc;
        this.backImgSrc = backImgSrc;

        // Indicates whether or not the card can be played. Is made true when a card is drawn. Is made false again after being played, or when being discarded.
        this.isPlayable = false;
    }
}

// Define the deck class, which is made up of a grouping of cards. The cards in the deck can be in any of 3 groups within the deck; the draw pile, the hand, and the discard pile.
class Deck {
    constructor() {
        // All cards in a new deck start in the draw pile. The default deck has 10 cards; 5 Attack +1 cards, and 5 Defense +1 cards.
        // NOTE: The top of the draw pile is at array index 0 (zero).
        this.drawPile = [
            new Card('attack', 1, 'assets/attackCards/Attack Plus 1.png', 'assets/Card Back.png'),
            new Card('attack', 1, 'assets/attackCards/Attack Plus 1.png', 'assets/Card Back.png'),
            new Card('attack', 1, 'assets/attackCards/Attack Plus 1.png', 'assets/Card Back.png'),
            new Card('attack', 1, 'assets/attackCards/Attack Plus 1.png', 'assets/Card Back.png'),
            new Card('attack', 1, 'assets/attackCards/Attack Plus 1.png', 'assets/Card Back.png'),
            new Card('defense', 1, 'assets/defenseCards/Defense Plus 1.png', 'assets/Card Back.png'),
            new Card('defense', 1, 'assets/defenseCards/Defense Plus 1.png', 'assets/Card Back.png'),
            new Card('defense', 1, 'assets/defenseCards/Defense Plus 1.png', 'assets/Card Back.png'),
            new Card('defense', 1, 'assets/defenseCards/Defense Plus 1.png', 'assets/Card Back.png'),
            new Card('defense', 1, 'assets/defenseCards/Defense Plus 1.png', 'assets/Card Back.png')
        ];

        // The hand and discard piles start empty.
        this.hand = [];
        // NOTE: In contrast to the draw pile, the top of the discard pile is at the maximum current array index.
        this.discardPile = [];
    }

    // Draws the top 5 cards from the draw pile and places them into the hand.
    draw() {
        for (let i = 0; i <= 4; i++) {
            this.hand.push(this.drawPile.shift());
            // When moving a card from the draw pile to the hand, make it playable.
            this.hand[i].isPlayable = true;
            // Shuffle the discard pile and place it in the draw pile if no cards remain in the draw pile.
            if (this.drawPile.length === 0) {
                this.discardToDraw();
            }
        }
    }

    // Adds a new card to the deck by placing it on top of the discard pile.
    addCardToDeck(card) {
        this.discardPile.push(card);
    }

    // Places all cards in the hand on top of the discard pile.
    discard() {
        for (let i = 0; i < this.hand.length; i++) {
            // Ensure that all cards in the discard pile are not playable, whether or not the player played them during the "Monster Supplement" turn state.
            this.hand[i].isPlayable = false;
            this.discardPile.push(this.hand[i]);
        }
        this.hand = [];
    }

    // Shuffles the discard pile and places it at the bottom of the draw pile.
    discardToDraw() {
        Deck.shuffle(this.discardPile);
        for (let i = 0; i < this.discardPile.length; i++) {
            this.drawPile.push(this.discardPile[i]);
        }
        this.discardPile = [];
    }

    // TO BE USED AT INSTANTIATION OF A NEW DECK. Shuffles the draw pile.
    shuffleStarterDeck() {
        Deck.shuffle(this.drawPile);
    }

    // Function to re-arrange all cards in the card array passed into the function.
    static shuffle(arrCards) {
        for (let i = arrCards.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [arrCards[i], arrCards[j]] = [arrCards[j], arrCards[i]];
        }
    }
}

// Define the monster class.
class Monster {
    constructor(imgSrc) {
        this.imgSrc = imgSrc;
        this.health = 10;
        this.attack = 0;
        this.defense = 1;

        // Is used to indicate whether a monster has already made an action and cannot perform another action. Is made false upon performance of an action. Is made true again at the beginning of the owning player's turn.
        this.isActive = true;
    }

    // Increases the monster's attack stat upon use of an attack card on this monster.
    increaseAttack(amount) {
        this.attack += amount;
    }

    // Increases the monster's defense stat upon use of a defense card on this monster.
    increaseDefense(amount) {
        this.defense += amount;
    }

    // Called when an enemy attacks this monster.
    takeDamage(amountDmg) {
        this.health = Math.max(this.health - amountDmg, 0);
    }

    // Called if a monster is chosen to defend an attack.
    defendAttack(amountDmg) {
        // Stops the defending monster from taking negative damage (a.k.a, gaining health from being attacked).
        let damageToTake = Math.max(amountDmg - this.defense, 0);
        this.takeDamage(damageToTake);
    }

    // Called to attack and do damage to an enemy monster. Takes in the targeted enemy monster and a defending enemy monster, if any.
    attackEnemy(enemyMonster, defendingMonster) {
        if (defendingMonster !== null && defendingMonster !== undefined) {
            console.log('is a defending monster.');
            defendingMonster.defendAttack(this.attack);
        } else {
            enemyMonster.takeDamage(this.attack);
        }
    }
}

// Defines the player class.
class Player {
    constructor(name) {
        this.name = name;

        this.deck = new Deck();
        // Shuffles the starter deck upon creation of a new player.
        this.deck.shuffleStarterDeck();

        this.monsters = [
            new Monster('assets/monsters/monster1.png'),
            new Monster('assets/monsters/monster2.png'),
            new Monster('assets/monsters/monster3.png')
        ];
    }
}



// Variable used for testing. - To be removed.
let testPlayer = new Player('Jake');
console.log(testPlayer);