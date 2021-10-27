console.log("I'm linked to the HTML.");

// -------------------------  MODEL  --------------------------------
// Global Constants
const GAME_STATES = [
    'DRAW',
    'SELECT A CARD FROM YOUR HAND TO PLAY',
    'SELECT AN ALLIED MONSTER TO PLAY THE CARD ON',
    'SELECT AN ALLIED MONSTER TO ATTACK WITH',
    // 'SELECT A MONSTER ACTION TO PERFORM',  // This state to be added if "Specials" stretch goal is reached.
    'SELECT AN ENEMY MONSTER AS THE ACTION TARGET',
    'OPPORTUNITY FOR OPPOSING PLAYER TO DEFEND',
    'DISCARD',
    'GAME OVER',
    'HOW TO PLAY'
];

// Global State Variables
let currentGameState;
let lastGameState;
let handCardsToPlay;
let selectedCard;
let selectedAttackingMonster;
let selectedMonsterToAttack;
let selectedDefendingMonster;
// + Players
let activePlayer;
let inactivePlayer;


// ---------------------------  VIEW  ---------------------------------
// Cache re-usable DOM elements.
// + Info bar elements
let activePlayerIndicatorEl = document.getElementById('playerTurnIndicator');
let turnStateIndicatorEl = document.getElementById('turnStateIndicator');
let howToPlayBtn = document.getElementById('howToPlayBtn');
let resetBtn = document.getElementById('resetBtn');
// + Inactive player elements
let inactivePlayerDrawEl = document.getElementById('inactivePlayerDraw');
let inactivePlayerMonstersEl = document.getElementById('inactivePlayerMonsters');
let inactivePlayerDiscardEl = document.getElementById('inactivePlayerDiscard');
// + Active player elements
let activePlayerDrawEl = document.getElementById('activePlayerDraw');
let activePlayerMonstersEl = document.getElementById('activePlayerMonsters');
let activePlayerDiscardEl = document.getElementById('activePlayerDiscard');
let activePlayerHandEl = document.getElementById('activePlayerHand');
// + Right sidebar elements
let pickableCardsEl = document.getElementById('pickableCards');
let nextStateBtn = document.getElementById('nextStateBtn');
// + How to Play instructions
let howToPlayInstEl = document.getElementById('instructionsArea');


// -------------------------  CONTROLLER  ------------------------------
// Set function to run on page load
window.addEventListener('onload', init);

// Initialization function to be called on page load.
function init() {
    currentGameState = GAME_STATES[0];
    lastGameState = null;
    handCardsToPlay = 3;
    selectedCard = null;
    selectedAttackingMonster = null;
    selectedMonsterToAttack = null;
    selectedDefendingMonster = null;

    let randomPlayer = Math.floor((Math.random() * 2) + 1);
    if (randomPlayer === 1) {
        activePlayer = new Player('Jake');
        inactivePlayer = new Player('Anna');
    } else if (randomPlayer === 2) {
        activePlayer = new Player('Anna');
        inactivePlayer = new Player('Jake');
    }
    updateGameStateIndicators();
    activePlayerDrawEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') });
    howToPlayBtn.addEventListener('click', function (event) { changeGameState(event, "HOW TO PLAY") });
}

function updateGameStateIndicators() {
    activePlayerIndicatorEl.innerHTML = `It's ${activePlayer.name}'s turn.`;
    turnStateIndicatorEl.innerHTML = `${currentGameState}`;
}

// Called at end of discard state (when turn change occurs).
function swapActivePlayer() {
    let tempPlayer = activePlayer;
    activePlayer = inactivePlayer;
    inactivePlayer = tempPlayer;
}

// Game State change function. Restricts the changing of states to only those that make sense based on the current game state.
/* function changeGameState(event, destinationState, stateException) {
    // User wants the instructions to be displayed.
    if (destinationState === 'HOW TO PLAY') {
        howTo_StateChange(destinationState);
    } else if (destinationState === 'NEXT') {
        // Current game state = DRAW
        if (currentGameState === GAME_STATES[0]) {
            draw_StateChange();
            // Current game state = SELECT A CARD FROM YOUR HAND TO PLAY
        } else if (currentGameState === GAME_STATES[1]) {
            selectHandCard_StateChange(event);
            // Current game state = SELECT AN ALLIED MONSTER TO PLAY THE CARD ON
        } else if (currentGameState === GAME_STATES[2]) {
            selectMonsterToPlayCardOn_StateChange(event);
            // Current game state = SELECT AN ALLIED MONSTER TO ATTACK WITH
        } else if (currentGameState === GAME_STATES[3]) {
            // A state exception is passed in as true when a player still has monsters that are active, but clicks the button to end the phase without using all of their availabe actions.
            if (!stateException) {
                currentGameState = GAME_STATES[4];
            } else if (stateException) {
                currentGameState = GAME_STATES[7];
            }

            // Current game state = SELECT A MONSTER ACTION TO PERFORM
        } else if (currentGameState === GAME_STATES[4]) {
            currentGameState = GAME_STATES[5];
            // Current game state = SELECT AN ENEMY MONSTER AS THE ACTION TARGET
        } else if (currentGameState === GAME_STATES[5]) {
            for (let i = 0; i < inactivePlayer.monsters.length; i++) {
                if (inactivePlayer.monsters[i].isActive) {
                    currentGameState = GAME_STATES[6];
                }

            }
            if (!stateException) {
                currentGameState = GAME_STATES[6];
            } else if (stateException) {
                currentGameState = GAME_STATES[]
            }
            // Current game state = OPPORTUNITY FOR OPPOSING PLAYER TO DEFEND
        } else if (currentGameState === GAME_STATES[6]) {
            // Check whether any active monsters remain for the active player to use.
            let anyActive = false;
            for (let i = 0; i < activePlayer.monster.length; i++) {
                if (activePlayer.monsters[i].isActive) {
                    anyActive = true;
                }
            }
            if (anyActive) {
                currentGameState = GAME_STATES[3];
            } else if (!anyActive) {
                currentGameState = GAME_STATES[7];
            }
            // Current game state = DISCARD
        } else if (currentGameState === GAME_STATES[7]) {
            currentGameState = GAME_STATES[]

            // Current game state = GAME OVER
        } else if (currentGameState === GAME_STATES[8]) {

            // Current game state = HOW TO PLAY
        } else if (currentGameState === GAME_STATES[9]) {
            howTo_StateChange(destinationState);
        }
    } else if (destinationState === 'GAME OVER') {
        currentGameState = GAME_STATES[0];
    }
} */

function howTo_StateChange(destinationState) {
    // Executes on howToPlayBtn click. User wants the instructions to be displayed.
    if (destinationState === 'HOW TO PLAY') {
        howToPlayBtn.removeEventListener('click', function (event) { changeGameState(event, "HOW TO PLAY") });
        howToPlayInstEl.style.display = 'flex';
        howToPlayBtn.innerHTML = 'Return to Game';
        lastGameState = currentGameState;
        currentGameState = GAME_STATES[9];
        howToPlayBtn.addEventListener('click', function (event) { changeGameState(event, "NEXT") });
        // Executes when the user no longer wants the instructions to be displayed.
    } else if (destinationState === 'NEXT') {
        howToPlayBtn.removeEventListener('click', function (event) { changeGameState(event, "NEXT") });
        howToPlayInstEl.style.display = 'none';
        howToPlayBtn.innerHTML = 'How to Play';
        currentGameState = lastGameState;
        lastGameState = null;
        howToPlayBtn.addEventListener('click', function (event) { changeGameState(event, "HOW TO PLAY") });
    }
}

function draw_StateChange() {
    // Deactive the event listener for this state.
    activePlayerDrawEl.removeEventListener('click', function (event) { changeGameState(event, 'NEXT') });

    // Update the Model by calling the draw function.
    activePlayer.deck.draw();
    for (let i = 0; i < activePlayer.deck.hand.length; i++) {
        // Set the image to be displayed as that of the cards in the player's hand.
        activePlayerHandEl.children[i].src = activePlayer.deck.hand[i].frontImageSrc;
        // Set the hand elements to be completely opaque, indicating that they can be selected to play.
        activePlayerHandEl.children[i].style.opacity = 1;
    }

    // Advance the game state to the "SELECT A CARD FROM YOUR HAND TO PLAY" state.
    currentGameState = GAME_STATES[1];
    // Activate the event listener for the next state.
    activePlayerHandEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') });
}

function selectHandCard_StateChange(event) {
    // Deactive the event listener for this state.
    activePlayerHandEl.removeEventListener('click', function (event) { changeGameState(event, 'NEXT') });

    // Check which of the cards in the player's hand was selected and if it can be played (is active). If that card can be played, play it. If not, wait for another card in the player's hand to be clicked.
    for (let i = 0; i < activePlayer.deck.hand.length; i++) {
        if (event.target === activePlayerHandEl.children[i]) {
            if (activePlayer.deck.hand[i].isActive) {
                // Set the selected card as the, well... selected card.
                selectedCard = activePlayer.deck.hand[i];
                // Make the card inactive so that it cannot be played again. Also make that inactive status visible by changing the selected card's opacity.
                activePlayer.deck.hand[i].isActive = false;
                event.target.style.opacity = 0.6;
                // Decrement the numbers of cards yet to be played.
                handCardsToPlay--;
                // Advance the game state to the "SELECT AN ALLIED MONSTER TO PLAY THE CARD ON" state.
                currentGameState = GAME_STATES[2];
                // Activate the event listener for the next state.
                activePlayerMonstersEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') });
            } else if (!activePlayer.deck.hand[i].isActive) {
                // Reactivate the hand event listener to wait for another hand card to be clicked.
                activePlayerHandEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') });
            }
        }
    }
}

function selectMonsterToPlayCardOn_StateChange(event) {
    // Deactive the event listener for this state.
    activePlayerMonstersEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') });

    // Check which monster was selected.
    for (let i = 0; i < activePlayer.monsters.length; i++) {
        if (event.target === activePlayerMonstersEl.children[i]) {
            // If the selected monster's health is below 0 (zero), then don't allow the card to be played on that monster and wait for another monster to be selected.
            if (activePlayer.monsters[i].health === 0) {
                // Reactivate the monster event listener to wait for another monster to be clicked.
                activePlayerMonstersEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') });
                // If the selected monster's health is above 0 (zero), then play the card on that monster.
            } else if (activePlayer.monsters[i].health > 0) {
                if (selectedCard.type === 'attack') {
                    activePlayer.monsters[i].increaseAttack(selectedCard.amount);
                    // The card has been played; set the selected card to null.
                    selectedCard = null;
                } else if (selectedCard.type === 'defense') {
                    activePlayer.monsters[i].increaseDefense(selectedCard.amount);
                    // The card has been played; set the selected card to null.
                    selectedCard = null;
                }
                // Activate the event listener for the next game state.
                if (handCardsToPlay > 0) {
                    currentGameState = GAME_STATES[1];
                    activePlayerHandEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') });
                } else if (handCardsToPlay <= 0) {
                    currentGameState = GAME_STATES[3];
                    activePlayerMonstersEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') });
                    // Activate the next state button so that the active player may choose to stop attacking before all of their monsters have attacked.
                    nextStateBtn.addEventListener('click', function (event) { changeGameState(event, 'NEXT', true) });
                }
            }
        }
    }
}

function selectMonsterToAttackWith_StateChange(event) {
    // Deactivate the event listener for this state.
    activePlayerMonstersEl.removeEventListener('click', function (event) { changeGameState(event, 'NEXT') });

    for (let i = 0; i < activePlayer.monsters.length; i++) {
        if (event.target === activePlayerMonstersEl.children[i]) {
            // Check if the selected monster hasn't attacked (isActive) and is alive. If so, that monster becomes selected to attack.
            if (activePlayer.monsters[i].isActive && activePlayer.monsters[i].health > 0) {
                // Set the selected monster as the attacking monster.
                selectedAttackingMonster = activePlayer.monsters[i];
                // Set the selected monster to inactive, so that it cannot be use to attack again during this turn, or defend during the next player's turn. To be reset to true upon the beginning of the player's next turn.
                activePlayer.monsters[i].isActive = false;
                // Call the function to visually indicate which monster has been selected to attack.
                renderAttackingMonster();
                // Advance the game state to the "SELECT AN ENEMY MONSTER AS THE ACTION TARGET" state.
                currentGameState = GAME_STATES[4];
                // Activate the event listener for the next state.
                inactivePlayerMonstersEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') })
                // If the selected monster is not active, or has been subdued, reactive the monster selection event listener and wait for another monster to be selected.
            } else {
                // Reactive the monster selection event listener
                activePlayerMonstersEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') });
            }

        }
    }
}

function selectActionTarget_StateChange(event) {

}

function opportunityToDefend_StateChange(event) {

}

function discard_StateChange(event) {
    //

}

function gameOver_StateChange(event) {

}

// +++++ Render Functions +++++
function renderAttackingMonster() {

}