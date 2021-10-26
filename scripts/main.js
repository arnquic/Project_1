console.log("I'm linked to the HTML.");

// -------------------------  MODEL  --------------------------------
// Global Constants
const GAME_STATES = [
    'DRAW',
    'SELECT A CARD FROM YOUR HAND TO PLAY',
    'CHOOSE AN ALLIED MONSTER TO PLAY THE CARD ON',
    'CHOOSE A MONSTER TO PERFORM AN ACTION',
    'CHOOSE A MONSTER ACTION TO PERFORM',
    'CHOOSE AN ENEMY MONSTER AS THE ACTION TARGET',
    'OPPORTUNITY FOR OPPOSING PLAYER TO DEFEND',
    'DISCARD',
    'GAME OVER',
    'HOW TO PLAY'
];

// Global State Variables
let currentGameState;
let lastGameState;
let handCardsToPlay;
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


// -------------------------  CONTROLLER  ------------------------------
// Set function to run on page load
window.addEventListener('onload', init);

// Initialization function to be called on page load.
function init() {
    currentGameState = GAME_STATES[0];
    lastGameState = null;
    handCardsToPlay = 3;

    let randomPlayer = Math.floor((Math.random() * 2) + 1);
    if (randomPlayer === 1) {
        activePlayer = new Player('Jake');
        inactivePlayer = new Player('Anna');
    } else if (randomPlayer === 2) {
        activePlayer = new Player('Anna');
        inactivePlayer = new Player('Jake');
    }
    updateGameStateIndicators();
    activePlayerDrawEl.addEventListener('click', changeGameState('NEXT'));
}

function handleClick(event) {
    if (event.target === howToPlayBtn) {

    } else if (event.target === resetBtn) {

    } else if (event.target === activePlayerDrawEl) {

    }
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
function changeGameState(destinationState, stateException) {
    // User wants the instructions to be displayed.
    if (destinationState === 'HOW TO PLAY') {
        howToStateChange(destinationState);
    } else if (destinationState === 'NEXT') {
        // Current game state = DRAW
        if (currentGameState === GAME_STATES[0]) {
            drawStateChange();
            // Current game state = CHOOSE A HAND CARD TO PLAY
        } else if (currentGameState === GAME_STATES[1]) {
            currentGameState = GAME_STATES[2];
            // Current game state = CHOOSE ALLIED MONSTER TO PLAY CARD ON
        } else if (currentGameState === GAME_STATES[2]) {
            if (handCardsToPlay > 0) {
                currentGameState = GAME_STATES[1];
            } else {
                currentGameState = GAME_STATES[3];
            }
            // Current game state = CHOOSE A MONSTER TO PERFORM AN ACTION
        } else if (currentGameState === GAME_STATES[3]) {
            // A state exception is passed in as true when a player still has monsters that are active, but clicks the button to end the phase without using all of their availabe actions.
            if (!stateException) {
                currentGameState = GAME_STATES[4];
            } else if (stateException) {
                currentGameState = GAME_STATES[7];
            }

            // Current game state = CHOOSE A MONSTER ACTION TO PERFORM
        } else if (currentGameState === GAME_STATES[4]) {
            currentGameState = GAME_STATES[5];
            // Current game state = CHOOSE AN ENEMY MONSTER AS THE ACTION TARGET
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
            howToStateChange(destinationState);
        }
    } else if (destinationState === 'GAME OVER') {
        currentGameState = GAME_STATES[0];
    }
}

function howToStateChange(destinationState) {
    // Executes on howToPlayBtn click. User wants the instructions to be displayed.
    if (destinationState === 'HOW TO PLAY') {
        lastGameState = currentGameState;
        currentGameState = GAME_STATES[9];
        // Executes when the user no longer wants the instructions to be displayed.
    } else if (destinationState === 'NEXT') {
        currentGameState = lastGameState;
        lastGameState = null;
    }
}

function drawStateChange() {
    activePlayer.deck.draw();
    for (let i = 0; i < activePlayer.deck.drawPile.length; i++) {
        activePlayerHandEl.children[i].src = activePlayer.deck.drawPile[i].frontImageSrc;
    }
}