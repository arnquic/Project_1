# Project 1: "Deck"

## Overview
Deck is a minimalistic take on the two-player turn-based card game. It is intended to be simple to learn while also offering just enough intricacy to allow for different play styles.

The objective of the game is to subdue all of your opponent's monsters before they subdue yours.

## Game Rules
* <u>Game Start:</u>
    - *(MVP)* Each player starts with the same deck of nine (10) shuffled cards:
        + 5 "+1" Attack cards
        + 5 "+1" Defense cards
    - *(If "Special Actions" stretch goal is met)* Each player starts with the same deck of nine (9) shuffled cards:
        + 3 "+1" Attack cards
        + 3 "+1" Defense cards
        + 3 "+1" Special cards
    - Each player starts with the same three (3) default monsters. Those monsters have the following attributes:
        + Health = 10
        + Attack = 0;
        + Defense = 1;
        + *(Stretch Goal)* Special = 0;
* <u>Draw turn state:</u> During their turn, the active player will draw 5 cards from their draw pile. If there are not enough cards in that player's draw pile, their discard pile will be shuffled and appended to their draw pile.
* <u>*(Stretch Goal)* Deck Supplement turn state:</u> If any cards remain in any of the 3 pickable card piles, the player may select the top card from one pile and place it in their discard pile.
* <u>Monster Supplement turn state:</u> The active player then must play 3 of the cards in their hand. Each played card is applied to one monster, increasing the indicated stat (attack, defense, *(Stretch Goal)* or special) of that monster by the amount indicated on the card.
* <u>Monster Action turn state:</u> The active player may choose to attack, use a special, or do nothing with each of their active monsters. Those actions behave in the following ways:
    - <u>Attack:</u> Choose an enemy monster to attack. If that enemy monster is in an inactive state (meaning that they performed an action on their last turn), their defense does nothing.
        + *(Stretch Goal)* The inactive player may choose to use one of their active monsters to defend the monster that is under attack. Upon defending, the inactive player's monster becomes inactive and cannot defend again.
    - <u>*(Stretch Goal)* Special:</u> The following actions are available when choosing to use a special:
        + *(Stretch Goal)* Increase allied monster's Attack stat by "My Special Stat x 0.5". This increase is good for one attack on the turn that the stat was increased.
        + *(Stretch Goal)* Increase allied monster's Defense stat by "My Special Stat x 0.5". This increase is good for one defense on the turn (in this case the turn extends to the other player's turn) that the stat was increased.
        + *(Stretch Goal)* Add poison to an allied monster's attack. The poison is applied to the enemy monster upon attack and lasts for 3 turns.
        + *(Stretch Goal)* Remove allied monster's poison effect.
        + *(Stretch Goal)* Attack 2 targets. The targets must be different (note that this is a meaningless action if the enemy has only one remaining active monster).
    - <u>*(Stretch Goal)* Defense:</u> This action does not take place on the active player's turn. If you do nothing with a monster, they are then available to defend an attack on the other player's turn. (see "Attack" for more information).
* <u>Discard turn state:</u> All of cards within the active player's hand (whether played during the "Monster Action turn state" or not) are placed into that player's discard pile.
* <u>End of turn.</u> This ends the active player's turn and the next player begins their turn.

## Game State Flow
See the attached "ReadMeReferences/Game State Flow" file.

## Wireframes
See the attached files within "ReadMeReferences/Wireframes".

## User Stories
Update user stories so that they read like first person, if I were a user playing the game.
1. When my turn starts, I see my hand, my monsters, and the enemy's monsters.
2. When I start my taking my turn I choose 3 cards from my hand to play and what monster of mine to play them on. This makes my monster stronger.
3. Then I decide if I want to attack with any of my monsters. If I do decide to attack with any or all of them, I must choose the target for each of the attacks.
4. Once I'm done choosing whether to attack, or if I've attacked with every monster, I click the "Next Phase" button.
5. I discard all of the cards in my hand.
6. It is now the end of my turn.
7. My opponent now starts their turn.


## MVP Checklist
How to technically fulfill the game (e.g., function to deal cards)
* Player class
    - Contains a Deck
    - Contains 3 Monsters
* Monster class
    - Holds image source for monster
    - Holds Health stat
    - Holds Attack stat
    - Holds Defense stat
* Deck class
    - Contains array of cards for draw pile
    - Contains array of cards for hand
    - Contains array of cards for discard pile
    - Has function to shuffle a given array of cards
    - Has function to use shuffle function in order to shuffle the the starting deck before play starts
    - Has function to use shuffle function in order to shuffle the discard pile and add it to the draw pile
* Card class
    - Holds card type (attack, defense)
    - Holds amount (+1, +2, etc)
    - Holds image source for front
    - Holds image source for back
* Simple State Machine
    - Variables
        + Variable to track which player's turn it is
        + Variable to track number 
        + Variable to track the current turn state & game over state (Draw, Play Hand, Play Card on monster, Monster to perform action, Which monster action to perform, Monster action target, Defend Opportunity, Discard, and Game Over)
        + Variable to track how many cards have been played during the "Play Hand" state
    - State Transition Functions (on click)
        + function to allow for transition from Draw TO Play Hand
        + function to allow for transition from Play Hand TO Play Hand on monster
        + function to allow for transition from Play Hand on monster TO Play Hand
        + function to allow for transition from Play Hand on monster TO Monster to perform action selection
        + function to allow for transition from Monster to perform action TO Which monster action to perform
        + function to allow for transition from Which monster action TO perform TO Monster action target
        + function to allow for transition from Monster action target TO Monster to perform action
        + function to allow for transition from Monster to perform action to Discard
        + function to allow for transition from Discard to next player's Draw
    - Render functions
        + Show active player and what turn state it is
        + Show hand (drawn cards)
        + Show game board
        + Show selected card from hand and monsters it can be applied to
        + Show selected monster and actions it can take
        + Show selected monster, selected action, and enemy monsters it can act upon
        + Show button to end "Monster Action" turn state.
        + Show "How to Play" instructions
        + Show winner and "Play Again" button
    - Function to handle damaging a monster when attacking

## Sprint Checklist
1. Tuesday Morning: All classes (Card, Deck, Monster, and Player) completed.
2. Tuesday Afternoon: HTML completed.
3. Tuesday Night: State Machine variables implemented, functions begun.
3. Wednesday Night: State Machine and Render functions implemented.
4. Thursday Night: CSS styling complete.
5. Friday at Afternoon (due date/time): Any stretch goals.

## Stretch Goals
* Start Menu
* User naming of players.
* Three decks of cards that the user may choose from to supplement their starting deck.
    - The three decks may each be added individually, with each addition being a stretch goal.
* Allow monsters to "Defend" incoming attacks.
* Allow monsters to perform "Special" actions:
    - Apply poison to ally monster's attack
    - Remove ally monster's poison effect
    - Allow ally monster to attack 2 different enemy monster targets in one turn.
* Animations
    - Card flipping during the draw and card pick (card pick is a stretch goal) turn states.
    - Card movements (e.g., movement from draw pile to hand).
* Sounds
    - To go with animations (e.g., sound of a card flipping over).
    - To signify end or beginning or turn or turn state.
* Timer for each of the players' turn states (ensure that neither player is taking too long or has just left and stopped playing).
    - If the timer ends, the next turn state begins with a refreshed timer. The player takes no action for the current turn state if the timer ends (e.g., no monster attack(s) if the timer runs out during the attack turn state).

## Super Stretch Goal
* Option for AI opponent.

## Sources
    1. Attack card's "kick" icon is taken from "Icons 8" at: https://icons8.com/icon/11549/combat
    2. Monster 1's image is taken from "Icons 8" at: https://icons8.com/icon/3upVYuQvJuuB/monster-face
    3. Monster 2's image is taken from "Icons 8" at: https://icons8.com/icon/Hgs0qUeISUyd/monster
    4. Monster 3's image is taken from "Icons 8" at: https://img.icons8.com/ios/50/000000/mongrol.png
    5. Shuffle deck method in the Deck class has been modified from solution posted on: https://javascript.info/task/shuffle

### <u>Intellectual Property Claim</u>
Created and owned by C. Jake Arnquist as of date of first github commit (12 Oct. 2021).