console.log("I'm linked to the HTML.");

// #region -------------------------  MODEL  --------------------------------
// Global Constants
const GAME_STATES = [
    'DRAW',
    'SELECT A CARD FROM YOUR HAND TO PLAY',
    'SELECT AN ALLIED MONSTER TO PLAY THE CARD ON',
    'SELECT AN ALLIED MONSTER TO ATTACK WITH',
    // 'SELECT A MONSTER ACTION TO PERFORM',  // This state to be added if "Specials" stretch goal is reached.
    'SELECT AN ENEMY MONSTER TO ATTACK',
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
let attackingMonsterIndex;
let monsterToAttackIndex;
let selectedDefendingMonster;
// + Players
let activePlayer;
let inactivePlayer;
// + Event listener abort controllers
let nextStateBtnController;
let howToBtnController;
// #endregion

// #region ---------------------------  VIEW  ---------------------------------
// Cache re-usable DOM elements.
// + Info bar elements
let activePlayerIndicatorEl = document.getElementById('playerTurnIndicator');
let turnStateIndicatorEl = document.getElementById('turnStateIndicator');
let howToPlayBtn = document.getElementById('howToPlayBtn');
let howToPlayInstEl = document.getElementById('instructionsArea');
let resetBtn = document.getElementById('resetBtn');
// + Inactive player elements
let inactivePlayerDrawEl = document.getElementById('inactivePlayerDraw');
let inactivePlayerMonstersEl = document.getElementById('inactivePlayerMonsters');
let inactivePlayerDiscardEl = document.getElementById('inactivePlayerDiscard');
// + Active player elements
let activePlayerDrawEl = document.getElementById('activePlayerDrawImg');
let activePlayerMonstersEl = document.getElementById('activePlayerMonsters');
let activePlayerDiscardEl = document.getElementById('activePlayerDiscard');
let activePlayerHandEl = document.getElementById('activePlayerHand');
// + Right sidebar elements
let pickableCardsEl = document.getElementById('pickableCards');
let nextStateBtn = document.getElementById('nextStateBtn');
// + Game Over element
let gameOverEl = document.getElementById('gameOverArea');

// #endregion

// -------------------------  CONTROLLER  ------------------------------
// Set function to run on page load
window.addEventListener('load', init);

// Initialization function to be called on page load.
function init() {
    currentGameState = GAME_STATES[0];
    lastGameState = null;
    handCardsToPlay = 3;
    selectedCard = null;
    attackingMonsterIndex = null;
    monsterToAttackIndex = null;
    selectedDefendingMonster = null;
    nextStateBtnController = new AbortController();
    howToBtnController = new AbortController();

    let randomPlayer = Math.floor((Math.random() * 2) + 1);
    if (randomPlayer === 1) {
        activePlayer = new Player('Jake');
        inactivePlayer = new Player('Anna');
    } else if (randomPlayer === 2) {
        activePlayer = new Player('Anna');
        inactivePlayer = new Player('Jake');
    }
    renderInit();
    activePlayerDrawEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') }), { once: true };
    howToPlayBtn.addEventListener('click', function (event) { changeGameState(event, "HOW TO PLAY") }, { once: true, signal: howToBtnController.signal });
    resetBtn.addEventListener('click', reset);
    console.log('init function has run.');
}

function reset() {
    howToBtnController.abort();
    init();
}


// Game State change function. Restricts the changing of states to only those that make sense based on the current game state.
function changeGameState(event, destinationState, stateException) {
    // User wants the instructions to be displayed.
    if (destinationState === 'HOW TO PLAY') {
        howTo_StateChange(destinationState);
    }
    else if (destinationState === 'NEXT') {
        // Current game state = DRAW
        if (currentGameState === GAME_STATES[0]) {
            draw_StateChange();
        }
        // Current game state = SELECT A CARD FROM YOUR HAND TO PLAY
        else if (currentGameState === GAME_STATES[1]) {
            selectHandCard_StateChange(event);
        }
        // Current game state = SELECT AN ALLIED MONSTER TO PLAY THE CARD ON
        else if (currentGameState === GAME_STATES[2]) {
            selectMonsterToPlayCardOn_StateChange(event);
        }
        // Current game state = SELECT AN ALLIED MONSTER TO ATTACK WITH
        else if (currentGameState === GAME_STATES[3]) {
            // A state exception is passed in as true when a player still has monsters that are active, but clicks the button to end the phase without using all of their availabe actions.
            if (!stateException) {
                selectMonsterToAttackWith_StateChange(event);
            } else if (stateException) {
                discard_StateChange();
            }
        }
        // Current game state = SELECT AN ENEMY MONSTER TO ATTACK
        else if (currentGameState === GAME_STATES[4]) {
            selectMonsterToAttack_StateChange(event);
        }
        // Current game state = OPPORTUNITY FOR OPPOSING PLAYER TO DEFEND
        else if (currentGameState === GAME_STATES[5]) {
            opportunityToDefend_StateChange(event);
        }
        // Current game state = DISCARD
        else if (currentGameState === GAME_STATES[6]) {
            discard_StateChange();
        }
        // Current game state = HOW TO PLAY
        else if (currentGameState === GAME_STATES[8]) {
            howTo_StateChange(destinationState);
        }
    }
    else if (destinationState === 'GAME OVER') {
        gameOver_StateChange();
    }
}

// #region +++++++ State Change Functions ++++++

function howTo_StateChange(destinationState) {
    // Executes on howToPlayBtn click. User wants the instructions to be displayed.
    if (destinationState === 'HOW TO PLAY') {
        lastGameState = currentGameState;
        currentGameState = GAME_STATES[8];
        howToPlayBtn.addEventListener('click', function (event) { changeGameState(event, "NEXT") }, { once: true, signal: howToBtnController.signal });
        // Executes when the user no longer wants the instructions to be displayed.
    } else if (destinationState === 'NEXT') {
        currentGameState = lastGameState;
        lastGameState = null;
        howToPlayBtn.addEventListener('click', function (event) { changeGameState(event, "HOW TO PLAY") }, { once: true, signal: howToBtnController.signal });
    }
    renderHowTo(destinationState);
}

function draw_StateChange() {
    // Update the Model by calling the draw function.
    activePlayer.deck.draw();
    // Advance the game state to the "SELECT A CARD FROM YOUR HAND TO PLAY" state.
    currentGameState = GAME_STATES[1];
    // Activate the event listener for the next state.
    activePlayerHandEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') }, { once: true });
    // Render the updated game state.
    renderDrawState();
}

function selectHandCard_StateChange(event) {
    console.log('the hand card that was clicked is: ', event.target);

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
                activePlayerMonstersEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') }, { once: true });
                renderGameStateIndicators();
            } else if (!activePlayer.deck.hand[i].isActive) {
                // Reactivate the hand event listener to wait for another hand card to be clicked.
                activePlayerHandEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') }, { once: true });
            }
        }
    }
}

function selectMonsterToPlayCardOn_StateChange(event) {
    // Check which monster was selected.
    for (let i = 0; i < activePlayer.monsters.length; i++) {
        if (event.target === activePlayerMonstersEl.children[i]) {
            // If the selected monster's health is below 0 (zero), then don't allow the card to be played on that monster and wait for another monster to be selected.
            if (activePlayer.monsters[i].health === 0) {
                // Reactivate the monster event listener to wait for another monster to be clicked.
                activePlayerMonstersEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') }, { once: true });
            }
            // If the selected monster's health is above 0 (zero), then play the card on that monster.
            else if (activePlayer.monsters[i].health > 0) {
                if (selectedCard.type === 'attack') {
                    activePlayer.monsters[i].increaseAttack(selectedCard.amount);
                    // The card has been played; set the selected card to null.
                } else if (selectedCard.type === 'defense') {
                    activePlayer.monsters[i].increaseDefense(selectedCard.amount);
                    // The card has been played; set the selected card to null.
                    selectedCard = null;
                }
                selectedCard = null;
                // Activate the event listener for the next game state.
                if (handCardsToPlay > 0) {
                    currentGameState = GAME_STATES[1];
                    activePlayerHandEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') }, { once: true });
                }
                else if (handCardsToPlay <= 0) {
                    currentGameState = GAME_STATES[3];
                    activePlayerMonstersEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') }, { once: true });
                    // Activate the next state button so that the active player may choose to stop attacking before all of their monsters have attacked.
                    activateNextStateBtn("Done Attacking");
                }
            }
        }
    }
}

function selectMonsterToAttackWith_StateChange(event) {
    for (let i = 0; i < activePlayer.monsters.length; i++) {
        if (event.target === activePlayerMonstersEl.children[i]) {
            // Check if the selected monster hasn't attacked (isActive) and is alive. If so, that monster becomes selected to attack.
            if (activePlayer.monsters[i].isActive && activePlayer.monsters[i].health > 0) {
                // Store the index of the monster that will be attacking.
                attackingMonsterIndex = i;
                // Set the selected monster to inactive, so that it cannot be use to attack again during this turn, or defend during the next player's turn. To be reset to true upon the beginning of the player's next turn.
                activePlayer.monsters[i].isActive = false;
                // Call the function to visually indicate which monster has been selected to attack.
                renderAttackingMonster(activePlayerMonstersEl.children[i]);
                // Advance the game state to the "SELECT AN ENEMY MONSTER TO ATTACK" state.
                currentGameState = GAME_STATES[4];
                // Abort the nextStateBtn's event listener, as the player has chosen to attack.
                inactivateNextStateBtn();
                // Activate the event listener for the next state.
                inactivePlayerMonstersEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') }, { once: true });

            }
            // If the selected monster is not active, or has been subdued, reactivate the monster selection event listener and wait for another monster to be selected.
            else {
                // Reactivate the monster selection event listener
                activePlayerMonstersEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') }, { once: true });
            }
        }
    }
}

function selectMonsterToAttack_StateChange(event) {
    // Check which monster was clicked.
    for (let i = 0; i < inactivePlayer.monsters.length; i++) {
        if (event.target === inactivePlayerMonstersEl.children[i]) {
            // Check if the selected monster is alive. If so, that monster becomes selected to attack.
            if (inactivePlayer.monsters[i].health > 0) {
                // Store the index of the monster that will be attacked.
                monsterToAttackIndex = i;
                // Call the function to visually indicate which monster has been selected to attack.
                renderMonsterToAttack(inactivePlayerMonstersEl.children[monsterToAttackIndex]);
                // If the inactivePlayer has any monsters available to defend, give them the opportunity to do so by advancing to the "OPPORTUNITY FOR OPPOSING PLAYER TO DEFEND" state.
                if (inactivePlayer.anyMonstersActive()) {
                    // Advance the game state to the "OPPORTUNITY FOR OPPOSING PLAYER TO DEFEND" state.
                    currentGameState = GAME_STATES[5];
                    // Activate the event listener for the inactivePlayer to choose a monster to defend with.
                    inactivePlayerMonstersEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') }, { once: true })
                    // Activate the event listener for the opposing player to choose not to defend.
                    activateNextStateBtn("Skip defending");
                }
                // If the inactivePlayer doesn't have any monsters available to defend with, immediately do damage and advance to the next phase.
                else {
                    // Attack the selected enemy and do damage.
                    activePlayer.monsters[attackingMonsterIndex].attackEnemy(inactivePlayer.monsters[monsterToAttackIndex]);
                    // If the player that was just attacked doesn't have any remaining monsters with health above 0, then the game is over and the active player wins.
                    if (!inactivePlayer.anyMonstersConscious) {
                        currentGameState = GAME_STATES[7];
                        changeGameState(null, 'NEXT');
                    }
                    // If the active player has any monsters remaining that are capable of attacking and the game isn't over, return to the state that allows them to select another monster to attack with.
                    else if (activePlayer.anyMonstersActive()) {
                        // This sets the game state to the "SELECT AN ALLIED MONSTER TO ATTACK WITH" game state.
                        currentGameState = GAME_STATES[3];
                        // Activate the event listener to allow the active player to select a monster that they would like to attack with.
                        activePlayerMonstersEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') }, { once: true });
                        // Activate the next state button so that the active player may choose to stop attacking before all of their monsters have attacked.
                        activateNextStateBtn("Done Attacking");
                    }
                    // If the active player doesn't have any monsters that are still capable of attacking, go to the "DISCARD" game state.
                    else {
                        currentGameState = GAME_STATES[6];
                        // Activate the next state button so that the active player can click something to discard their cards.
                        activateNextStateBtn("Discard your hand");
                    }
                }
            }
            // If the selected monster has been subdued, reactivate the monster selection event listener and wait for another monster to be selected.
            else {
                // Reactivate the monster selection event listener
                inactivePlayerMonstersEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') }, { once: true });
            }
        }
    }
}

function opportunityToDefend_StateChange(event) {
    // must deactivate the next state button as the inactive player has opted to use a monster to defend.
    inactivateNextStateBtn();
}

function discard_StateChange(event) {
    //
    activePlayer.deck.discard();
    currentGameState = GAME_STATES[0];
    swapActivePlayer();
    renderDiscard();
    renderHand();
    renderGameStateIndicators();
}

function gameOver_StateChange(event) {
    renderGameOver();
}
// #endregion

// #region +++++ Render Functions +++++
function renderInit() {
    gameOverEl.style.display = 'none';
    howToPlayInstEl.style.display = 'none';
    howToPlayBtn.innerHTML = 'How to Play';
    renderGameStateIndicators();
}

function renderGameStateIndicators() {
    activePlayerIndicatorEl.innerHTML = `It's ${activePlayer.name}'s turn.`;
    turnStateIndicatorEl.innerHTML = `${currentGameState}`;
}

function renderHowTo(destinationState) {
    // Executes on howToPlayBtn click. User wants the instructions to be displayed.
    if (destinationState === 'HOW TO PLAY') {
        howToPlayInstEl.style.display = 'flex';
        howToPlayBtn.innerHTML = 'Return to Game';
        // Executes when the user no longer wants the instructions to be displayed.
    } else if (destinationState === 'NEXT') {
        howToPlayInstEl.style.display = 'none';
        howToPlayBtn.innerHTML = 'How to Play';
    }
    renderGameStateIndicators();
}

function renderDrawState() {
    renderHand();
    renderGameStateIndicators();
}

function renderAttackingMonsterState(monsterEl) {
    monsterEl.style.backgroundColor = 'white';
}

function renderDoneWithAttackDefend(attackingMonsterEl, monsterBeingAttackedEl, defendingMonsterEl) {
    attackingMonsterEl.style.backgroundColor = 'grey';
    monsterBeingAttackedEl.style.backgroundColor = 'grey';
    if (defendingMonsterEl !== undefined && defendingMonsterEl !== null) {
        defendingMonsterEl.style.backgroundColor = 'grey';
    }
}

function renderDiscard() {
    if (activePlayer.deck.discardPile.length > 0) {
        activePlayerDiscardEl.children[0].src = activePlayer.deck.discardPile[activePlayer.deck.discardPile.length - 1].frontImgSrc;
    }
}

function renderGameOverState() {
    gameOverEl.children[0].children[0].innerHTML = `${activePlayer.name} Wins!`
    gameOverEl.style.display = 'flex';
}

function renderHand() {
    // Check if the player has cards in their hand. If they do, render the front images of those cards.
    if (activePlayer.deck.hand.length > 0) {
        for (let i = 0; i < activePlayerHandEl.length; i++) {
            // Set the image to display.
            activePlayerHandEl.children[i].style.display = 'flex';
            // Set the image to be displayed as that of the cards in the player's hand.
            activePlayerHandEl.children[i].src = activePlayer.deck.hand[i].frontImgSrc;
            // Set the hand elements to be completely opaque, indicating that they can be selected to play.
            activePlayerHandEl.children[i].style.opacity = 1;
        }
    }
    // If the player doesn't have cards in their hand render their hand as empty.
    else {
        for (let i = 0; i < activePlayerHandEl.children.length; i++) {
            activePlayerHandEl.children[i].style.display = 'none';
        }
    }
}

function renderNextStateBtn(btnTxt, displayStyl, btnColor) {
    nextStateBtn.innerHTML = btnTxt;
    nextStateBtn.style.display = displayStyl;
    nextStateBtn.style.color = btnColor;
}

// #endregion

// #region +++++  Additional Functions +++++
// Called at end of discard state (when turn change occurs).
function swapActivePlayer() {
    let tempPlayer = activePlayer;
    activePlayer = inactivePlayer;
    inactivePlayer = tempPlayer;
}

function activateNextStateBtn(btnTxt) {
    renderNextStateBtn(btnTxt, 'initial', 'white');
    nextStateBtn.addEventListener('click', function (event) { changeGameState(event, 'NEXT', true) }, { once: true, signal: nextStateBtnController.signal });
}

function inactivateNextStateBtn() {
    renderNextStateBtn('Inactive', 'none', 'black');
    nextStateBtnController.abort();
}

// #endregion