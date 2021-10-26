console.log("I'm linked to the HTML.");

// ------------  MODEL  --------------
// Global Constants
const GAME_STATES = [
    'DRAW',
    'CHOOSE A HAND CARD TO PLAY',
    'CHOOSE ALLIED MONSTER TO PLAY CARD ON',
    'CHOOSE A MONSTER TO PERFORM AN ACTION',
    'CHOOSE A MONSTER ACTION TO PERFORM',
    'CHOOSE AN ENEMY MONSTER AS THE ACTION TARGET',
    'OPPORTUNITY FOR OPPOSING PLAYER TO DEFEND',
    'DISCARD',
    'GAME OVER',
    'HOW TO PLAY'
];

// Global State Variables
let playerTurn;
let currentGameState;
let lastGameState;
let handCardsToPlay;

// Players
let player1;
let player2;







// ------------  VIEW  ---------------







// ---------  CONTROLLER  -----------
function init() {
    player1 = new Player('Jake');
    player2 = new Player('Anna');
    currentGameState = GAME_STATES[0];
    lastGameState = null;
    handCardsToPlay = 3;

    let randomPlayer = Math.floor((Math.random() * 2) + 1);
    if (randomPlayer === 1) {
        playerTurn = player1;
    } else {
        playerTurn = player2;
    }
}

// Game State change function. Restricts the changing of states to only those that make sense based on the current game state.
function gameStateChange(destinationState, stateException) {
    // Current game state = DRAW
    if (destinationState === 'HOW TO PLAY') {
        lastGameState = currentGameState;
        currentGameState = GAME_STATES[9];
    } else if (destinationState === 'NEXT') {
        if (currentGameState === GAME_STATES[0]) {
            currentGameState = GAME_STATES[1];
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
            // 
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
            for (let i = 0; i < 3; i++) {

            }
            currentGameState = GAME_STATES[]

            // Current game state = OPPORTUNITY FOR OPPOSING PLAYER TO DEFEND
        } else if (currentGameState === GAME_STATES[6]) {
            currentGameState = GAME_STATES[]

            // Current game state = DISCARD
        } else if (currentGameState === GAME_STATES[7]) {
            currentGameState = GAME_STATES[]

            // Current game state = GAME OVER
        } else if (currentGameState === GAME_STATES[8]) {

            // Current game state = HOW TO PLAY
        } else if (currentGameState === GAME_STATES[9]) {
            currentGameState = lastGameState;
            lastGameState = null;
        }
    } else if (destinationState === 'GAME OVER') {
        currentGameState = GAME_STATES[0];
    }
}