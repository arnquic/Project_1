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
let selectedCardIndex;
let attackingMonsterIndex;
let monsterToAttackIndex;
let defendingMonsterIndex;
// + Players
let activePlayer;
let inactivePlayer;
// + Event listener abort controllers
let nextStateBtnController;
let howToBtnController;
let currentNonUniqueStateController;
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
    selectedCardIndex = null;
    attackingMonsterIndex = null;
    monsterToAttackIndex = null;
    defendingMonsterIndex = null;
    nextStateBtnController = new AbortController();
    howToBtnController = new AbortController();
    currentNonUniqueStateController = new AbortController();

    let randomPlayer = Math.floor((Math.random() * 2) + 1);
    if (randomPlayer === 1) {
        activePlayer = new Player('Player 1');
        inactivePlayer = new Player('Player 2');
    } else if (randomPlayer === 2) {
        activePlayer = new Player('Player 2');
        inactivePlayer = new Player('Player 1');
    }
    renderInit();
    activePlayerDrawEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') }), { once: true, signal: currentNonUniqueStateController.signal };
    howToPlayBtn.addEventListener('click', function (event) { changeGameState(event, "HOW TO PLAY") }, { once: true, signal: howToBtnController.signal });
    resetBtn.addEventListener('click', reset);
    console.log('init function has run.');
}

function reset() {
    currentNonUniqueStateController.abort();
    howToBtnController.abort();
    init();
}


// Game State change function. Restricts the changing of states to only those that make sense based on the current game state.
function changeGameState(event, destinationState, stateException) {
    console.log('change game state has run');
    console.log('the destination state is: ', destinationState, 'and the state exception: ', stateException);
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
            // A state exception is passed in as true when the active player still has monsters that are active, but clicks the button to end the phase without using all of their availabe actions.
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
            // A state exception is passed in as true when the inactive player still has monsters that are active, but clicks the button to end the phase without using all of their availabe actions.
            if (!stateException) {
                opportunityToDefend_StateChange(event);
            } else if (stateException) {
                skippedDefending_StateChange();
            }
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
    currentNonUniqueStateController = new AbortController();
    activePlayerHandEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') }, { once: true, signal: currentNonUniqueStateController.signal });
    console.log('draw state change has run past adding a event listener');
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
                selectedCardIndex = i;
                // Make the card inactive so that it cannot be played again. Also make that inactive status visible by changing the selected card's opacity.
                activePlayer.deck.hand[i].isActive = false;
                event.target.style.opacity = 0.6;
                // Decrement the numbers of cards yet to be played.
                handCardsToPlay--;
                // Advance the game state to the "SELECT AN ALLIED MONSTER TO PLAY THE CARD ON" state.
                currentGameState = GAME_STATES[2];
                // Activate the event listener for the next state.
                currentNonUniqueStateController = new AbortController();
                activePlayerMonstersEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') }, { once: true, signal: currentNonUniqueStateController.signal });
                renderGameStateIndicators();
            } else if (!activePlayer.deck.hand[i].isActive) {
                // Reactivate the hand event listener to wait for another hand card to be clicked.
                currentNonUniqueStateController = new AbortController();
                activePlayerHandEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') }, { once: true, signal: currentNonUniqueStateController.signal });
            }
        }
    }
}

function selectMonsterToPlayCardOn_StateChange(event) {
    console.log("the event target of the monster to play card on state change is: ", event.target);
    // If a sub-element of the monster was clicked on, find the containing individual monster element.
    let individualMonsterEl = findMonsterEl(event.target);
    // The findMonsterEl function returns 'too high' if the parent to the individual monster elements was clicked. Only progress into the following code if an individual monster element is returned from the findMonsterEl function.
    if (individualMonsterEl !== 'too high') {
        // Check which monster was selected. NOTE: the player.monsters.length is the same length as the activePlayerMonstersEl.children.length.
        for (let i = 0; i < activePlayer.monsters.length; i++) {
            // If the selected monster element is equal to the player's monster element at this index, then that is the index we want to use.
            if (individualMonsterEl === activePlayerMonstersEl.children[i]) {
                // If the selected monster's health is below 0 (zero), then don't allow the card to be played on that monster and wait for another monster to be selected.
                if (activePlayer.monsters[i].health === 0) {
                    // Reactivate the monster event listener to wait for another monster to be clicked.
                    currentNonUniqueStateController = new AbortController();
                    activePlayerMonstersEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') }, { once: true, signal: currentNonUniqueStateController.signal });
                }
                // If the selected monster's health is above 0 (zero), then play the card on that monster.
                else if (activePlayer.monsters[i].health > 0) {
                    if (activePlayer.deck.hand[selectedCardIndex].type === 'attack') {
                        activePlayer.monsters[i].increaseAttack(activePlayer.deck.hand[selectedCardIndex].amount);
                    } else if (activePlayer.deck.hand[selectedCardIndex].type === 'defense') {
                        activePlayer.monsters[i].increaseDefense(activePlayer.deck.hand[selectedCardIndex].amount);
                    }
                    renderMonsterUpdates();
                    // The card has been played; set the selected card to null.
                    selectedCardIndex = null;
                    // Activate the event listener for the next game state.
                    if (handCardsToPlay > 0) {
                        currentGameState = GAME_STATES[1];
                        currentNonUniqueStateController = new AbortController();
                        activePlayerHandEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') }, { once: true, signal: currentNonUniqueStateController.signal });
                    }
                    else if (handCardsToPlay <= 0) {
                        currentGameState = GAME_STATES[3];
                        currentNonUniqueStateController = new AbortController();
                        activePlayerMonstersEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') }, { once: true, signal: currentNonUniqueStateController.signal });
                        // Activate the next state button so that the active player may choose to stop attacking before all of their monsters have attacked.
                        activateNextStateBtn("Done Attacking");
                    }
                }
            }
        }
    }
    // If the findMonsterEl function does return 'too high', reactivate the monster event listener to wait for an individual monster element to be clicked.
    else {
        currentNonUniqueStateController = new AbortController();
        activePlayerMonstersEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') }, { once: true, signal: currentNonUniqueStateController.signal });
    }
    renderGameStateIndicators();
}

function selectMonsterToAttackWith_StateChange(event) {
    console.log("the event target of the monster to attack with state change is: ", event.target);
    // If a sub-element of the monster was clicked on, find the containing individual monster element.
    let individualMonsterEl = findMonsterEl(event.target);
    // The findMonsterEl function returns 'too high' if the parent to the individual monster elements was clicked. Only progress into the following code if an individual monster element is returned from the findMonsterEl function.
    if (individualMonsterEl !== 'too high') {
        // Check which monster was selected. NOTE: the player.monsters.length is the same length as the activePlayerMonstersEl.children.length.
        for (let i = 0; i < activePlayer.monsters.length; i++) {
            if (individualMonsterEl === activePlayerMonstersEl.children[i]) {
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
                    currentNonUniqueStateController = new AbortController();
                    inactivePlayerMonstersEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') }, { once: true, signal: currentNonUniqueStateController.signal });

                }
                // If the selected monster is not active, or has been subdued, reactivate the monster selection event listener and wait for another monster to be selected.
                else {
                    // Reactivate the monster selection event listener
                    currentNonUniqueStateController = new AbortController();
                    activePlayerMonstersEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') }, { once: true, signal: currentNonUniqueStateController.signal });
                }
            }
        }
    }
    // If the findMonsterEl function does return 'too high', reactivate the monster event listener to wait for an individual monster element to be clicked.
    else {
        currentNonUniqueStateController = new AbortController();
        activePlayerMonstersEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') }, { once: true, signal: currentNonUniqueStateController.signal });
    }
    renderGameStateIndicators();
}

function selectMonsterToAttack_StateChange(event) {
    console.log("the event target of the select monster to attack state change is: ", event.target);
    // If a sub-element of the monster was clicked on, find the containing individual monster element.
    let individualMonsterEl = findMonsterEl(event.target);
    // The findMonsterEl function returns 'too high' if the parent to the individual monster elements was clicked. Only progress into the following code if an individual monster element is returned from the findMonsterEl function.
    if (individualMonsterEl !== 'too high') {
        // Check which monster was selected. NOTE: the player.monsters.length is the same length as the activePlayerMonstersEl.children.length.
        for (let i = 0; i < inactivePlayer.monsters.length; i++) {
            if (individualMonsterEl === inactivePlayerMonstersEl.children[i]) {
                // Check if the selected monster is alive. If so, that monster becomes selected to attack.
                if (inactivePlayer.monsters[i].health > 0) {
                    // Store the index of the monster that will be attacked.
                    monsterToAttackIndex = i;
                    // Call the function to visually indicate which monster has been selected to attack.
                    renderMonsterToAttack();
                    // If the inactivePlayer has any monsters available to defend, give them the opportunity to do so by advancing to the "OPPORTUNITY FOR OPPOSING PLAYER TO DEFEND" state.
                    if (inactivePlayer.anyMonstersActive()) {
                        // Advance the game state to the "OPPORTUNITY FOR OPPOSING PLAYER TO DEFEND" state.
                        currentGameState = GAME_STATES[5];
                        // Activate the event listener for the inactivePlayer to choose a monster to defend with.
                        currentNonUniqueStateController = new AbortController();
                        inactivePlayerMonstersEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT', false) }, { once: true, signal: currentNonUniqueStateController.signal });
                        // Activate the event listener for the opposing player to choose not to defend.
                        activateNextStateBtn("Skip defending");
                    }
                    // If the inactivePlayer doesn't have any monsters available to defend with, immediately do damage and advance to the next phase.
                    else {
                        // Attack the selected enemy and do damage.
                        activePlayer.monsters[attackingMonsterIndex].attackEnemy(inactivePlayer.monsters[monsterToAttackIndex]);
                        // Render the monster model updates to the view.
                        renderDoneWithAttackDefend();
                        renderMonsterUpdates();
                        // If the player that was just attacked doesn't have any remaining monsters with health above 0, then the game is over and the active player wins.
                        if (!inactivePlayer.anyConsciousMonsters()) {
                            console.log('The inactive player has no conscious monsters after attacking.');
                            currentGameState = GAME_STATES[7];
                            changeGameState(null, 'GAME OVER');
                        }
                        // If the active player has any monsters remaining that are capable of attacking and the game isn't over, return to the state that allows them to select another monster to attack with.
                        else if (activePlayer.anyMonstersActive()) {
                            // This sets the game state to the "SELECT AN ALLIED MONSTER TO ATTACK WITH" game state.
                            currentGameState = GAME_STATES[3];
                            // Activate the event listener to allow the active player to select a monster that they would like to attack with.
                            currentNonUniqueStateController = new AbortController();
                            activePlayerMonstersEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') }, { once: true, signal: currentNonUniqueStateController.signal });
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
                    currentNonUniqueStateController = new AbortController();
                    inactivePlayerMonstersEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') }, { once: true, signal: currentNonUniqueStateController.signal });
                }
            }
        }
    }
    // If the findMonsterEl function does return 'too high', reactivate the monster event listener to wait for an individual monster element to be clicked.
    else {
        currentNonUniqueStateController = new AbortController();
        activePlayerMonstersEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') }, { once: true, signal: currentNonUniqueStateController.signal });
    }
    renderGameStateIndicators();
}

function opportunityToDefend_StateChange(event) {
    console.log('the inactive player clicked the following as their defending monster: ', event.target);
    // must deactivate the next state button as the inactive player has opted to use a monster to defend.
    inactivateNextStateBtn();
    // If a sub-element of the monster was clicked on, find the containing individual monster element.
    let individualMonsterEl = findMonsterEl(event.target);
    // The findMonsterEl function returns 'too high' if the parent to the individual monster elements was clicked. Only progress into the following code if an individual monster element is returned from the findMonsterEl function.
    if (individualMonsterEl !== 'too high') {
        // Check which monster was selected. NOTE: the player.monsters.length is the same length as the activePlayerMonstersEl.children.length.
        for (let i = 0; i < inactivePlayer.monsters.length; i++) {
            if (individualMonsterEl === inactivePlayerMonstersEl.children[i]) {
                if (inactivePlayer.monsters[i].isActive) {
                    defendingMonsterIndex = i;
                    console.log("the defending monster is: ", inactivePlayerMonstersEl.children[defendingMonsterIndex]);
                    // Render the defending monster as selected.
                    renderDefendingMonster();
                    // Attack the selected enemy and do damage.
                    activePlayer.monsters[attackingMonsterIndex].attackEnemy(inactivePlayer.monsters[monsterToAttackIndex], inactivePlayer.monsters[defendingMonsterIndex]);
                    // Render the monster model updates to the view.
                    renderDoneWithAttackDefend();
                    renderMonsterUpdates();
                    // If the player that was just attacked doesn't have any remaining monsters with health above 0, then the game is over and the active player wins.
                    if (!inactivePlayer.anyConsciousMonsters()) {
                        console.log('The inactive player has no conscious monsters after defending.');
                        currentGameState = GAME_STATES[7];
                        changeGameState(null, currentGameState);
                    }
                    // If the active player has any monsters remaining that are capable of attacking and the game isn't over, return to the state that allows them to select another monster to attack with.
                    else if (activePlayer.anyMonstersActive()) {
                        // This sets the game state to the "SELECT AN ALLIED MONSTER TO ATTACK WITH" game state.
                        currentGameState = GAME_STATES[3];
                        // Activate the event listener to allow the active player to select a monster that they would like to attack with.
                        currentNonUniqueStateController = new AbortController();
                        activePlayerMonstersEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') }, { once: true, signal: currentNonUniqueStateController.signal });
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
        }
    }
    // If the findMonsterEl function does return 'too high', reactivate the monster event listener to wait for an individual monster element to be clicked.
    else {
        currentNonUniqueStateController = new AbortController();
        activePlayerMonstersEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') }, { once: true, signal: currentNonUniqueStateController.signal });
        // Activate the event listener for the opposing player to choose not to defend.
        activateNextStateBtn("Skip defending");
    }
    renderGameStateIndicators();
}
function skippedDefending_StateChange() {
    console.log('skipped defending has run.');
    currentNonUniqueStateController.abort();
    currentNonUniqueStateController = new AbortController();
    // Attack the selected enemy and do damage.
    activePlayer.monsters[attackingMonsterIndex].attackEnemy(inactivePlayer.monsters[monsterToAttackIndex]);
    // Render the monster model updates to the view.
    renderDoneWithAttackDefend();
    renderMonsterUpdates();
    // If the player that was just attacked doesn't have any remaining monsters with health above 0, then the game is over and the active player wins.
    if (!inactivePlayer.anyConsciousMonsters()) {
        console.log('The inactive player has no conscious monsters after attacking.');
        currentGameState = GAME_STATES[7];
        changeGameState(null, currentGameState);
    }
    // If the active player has any monsters remaining that are capable of attacking and the game isn't over, return to the state that allows them to select another monster to attack with.
    else if (activePlayer.anyMonstersActive()) {
        // This sets the game state to the "SELECT AN ALLIED MONSTER TO ATTACK WITH" game state.
        currentGameState = GAME_STATES[3];
        // Activate the event listener to allow the active player to select a monster that they would like to attack with.
        currentNonUniqueStateController = new AbortController();
        activePlayerMonstersEl.addEventListener('click', function (event) { changeGameState(event, 'NEXT') }, { once: true, signal: currentNonUniqueStateController.signal });
        // Activate the next state button so that the active player may choose to stop attacking before all of their monsters have attacked.
        activateNextStateBtn("Done Attacking");
    }
    // If the active player doesn't have any monsters that are still capable of attacking, go to the "DISCARD" game state.
    else {
        currentGameState = GAME_STATES[6];
        // Activate the next state button so that the active player can click something to discard their cards.
        activateNextStateBtn("Discard your hand");
    }
    renderGameStateIndicators();
}

function discard_StateChange(event) {
    //
    activePlayer.deck.discard();
    currentGameState = GAME_STATES[0];
    swapActivePlayer();
    renderDiscard();
    renderHand();
    renderMonsterUpdates();
    renderGameStateIndicators();
    renderNextStateBtn('none', 'none', 'black');
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
    renderHand();
    renderDiscard();
    renderDoneWithAttackDefend();
    renderMonsterUpdates();
    renderGameStateIndicators();
}

function renderGameStateIndicators() {
    activePlayerIndicatorEl.innerHTML = `${activePlayer.name}'s turn:  `.toUpperCase();
    turnStateIndicatorEl.innerHTML = `${currentGameState}`.bold();
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
    renderDiscard();
    renderGameStateIndicators();
}

function renderMonsterUpdates() {
    for (let i = 0; i < activePlayerMonstersEl.children.length; i++) {
        // ---- Active Player ----
        //Update Name
        activePlayerMonstersEl.children[i].children[0].innerHTML = `${activePlayer.monsters[i].name}`;
        //Update Health
        activePlayerMonstersEl.children[i].children[2].children[0].innerHTML = `${activePlayer.monsters[i].health}/10`;
        // Update Attack
        activePlayerMonstersEl.children[i].children[3].children[0].innerHTML = activePlayer.monsters[i].attack;
        // Update Defense
        activePlayerMonstersEl.children[i].children[4].children[0].innerHTML = activePlayer.monsters[i].defense;
        // Update active status
        if (activePlayer.monsters[i].isActive) {
            activePlayerMonstersEl.children[i].style.opacity = 1;
        }
        else {
            activePlayerMonstersEl.children[i].style.opacity = 0.6;
        }
        // If the monster is subdued, change their background to red.
        if (activePlayer.monsters[i].health === 0) {
            activePlayerMonstersEl.children[i].style.backgroundColor = 'darkred';
            activePlayerMonstersEl.children[i].style.opacity = 0.6;
        } else {
            activePlayerMonstersEl.children[i].style.backgroundColor = 'grey';
        }
        // ---- Inactive Player ----
        //Update Name
        inactivePlayerMonstersEl.children[i].children[0].innerHTML = `${inactivePlayer.monsters[i].name}`;
        // Update Health
        inactivePlayerMonstersEl.children[i].children[2].children[0].innerHTML = `${inactivePlayer.monsters[i].health}/10`;
        // Update Attack
        inactivePlayerMonstersEl.children[i].children[3].children[0].innerHTML = inactivePlayer.monsters[i].attack;
        // Update Defense
        inactivePlayerMonstersEl.children[i].children[4].children[0].innerHTML = inactivePlayer.monsters[i].defense;
        // Update active status
        if (inactivePlayer.monsters[i].isActive) {
            inactivePlayerMonstersEl.children[i].style.opacity = 1;
        }
        else {
            inactivePlayerMonstersEl.children[i].style.opacity = 0.6;
        }
        // If the monster is subdued, change their background to red.
        if (inactivePlayer.monsters[i].health === 0) {
            inactivePlayerMonstersEl.children[i].style.backgroundColor = 'darkred';
            inactivePlayerMonstersEl.children[i].style.opacity = 0.6;
        } else {
            inactivePlayerMonstersEl.children[i].style.backgroundColor = 'grey';
        }
    }
}

function renderAttackingMonster() {
    activePlayerMonstersEl.children[attackingMonsterIndex].style.backgroundColor = 'white';
}

function renderMonsterToAttack() {
    inactivePlayerMonstersEl.children[monsterToAttackIndex].style.backgroundColor = 'white';
}

function renderDefendingMonster() {
    inactivePlayerMonstersEl.children[defendingMonsterIndex].style.backgroundColor = 'white';
    console.log('render defending monster has run. The defending monster element is: ', inactivePlayerMonstersEl.children[defendingMonsterIndex]);
}

function renderDoneWithAttackDefend() {
    if (attackingMonsterIndex !== null) {
        activePlayerMonstersEl.children[attackingMonsterIndex].style.backgroundColor = 'grey';
    }
    if (monsterToAttackIndex !== null) {
        inactivePlayerMonstersEl.children[monsterToAttackIndex].style.backgroundColor = 'grey';
    }
    if (defendingMonsterIndex !== null) {
        if (inactivePlayerMonstersEl.children[defendingMonsterIndex] !== undefined && inactivePlayerMonstersEl.children[defendingMonsterIndex] !== null) {
            inactivePlayerMonstersEl.children[defendingMonsterIndex].style.backgroundColor = 'grey';
        }
    }
    attackingMonsterIndex = null;
    monsterToAttackIndex = null;
    defendingMonsterIndex = null;
}

function renderDiscard() {
    if (activePlayer.deck.discardPile.length > 0) {
        activePlayerDiscardEl.style.display = 'flex';
        activePlayerDiscardEl.children[0].src = activePlayer.deck.discardPile[activePlayer.deck.discardPile.length - 1].frontImgSrc;
    } else {
        activePlayerDiscardEl.style.display = 'none';
    }
}

function renderGameOver() {
    console.log('renderGameOver has run');
    gameOverEl.children[0].children[0].innerHTML = `${activePlayer.name} Wins!`
    gameOverEl.style.display = 'flex';
}

function renderHand() {
    // Check if the player has cards in their hand. If they do, render the front images of those cards.
    console.log('The active player hand length is: ', activePlayer.deck.hand.length);
    if (activePlayer.deck.hand.length > 0) {
        // Set the hand to display.
        activePlayerHandEl.style.display = 'flex';
        for (let i = 0; i < activePlayerHandEl.children.length; i++) {
            console.log("the length of the active player's hand elements is: ", activePlayerHandEl.children.length);
            // Set the image to be displayed as that of the cards in the player's hand.
            activePlayerHandEl.children[i].src = activePlayer.deck.hand[i].frontImgSrc;
            // Set the hand elements to be completely opaque, indicating that they can be selected to play.
            activePlayerHandEl.children[i].style.opacity = 1;
        }
    }
    // If the player doesn't have cards in their hand render their hand as empty.
    else {
        activePlayerHandEl.style.display = 'none';
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
    activePlayer.makeMonstersActive();
    handCardsToPlay = 3;
    renderMonsterUpdates();
    currentNonUniqueStateController.abort();
    currentNonUniqueStateController = new AbortController();
}

function activateNextStateBtn(btnTxt) {
    renderNextStateBtn(btnTxt, 'initial', 'grey');
    nextStateBtnController = new AbortController();
    nextStateBtn.addEventListener('click', function (event) { changeGameState(event, 'NEXT', true) }, { once: true, signal: nextStateBtnController.signal });
    console.log('ran activate next state button through adding of event listener');
    console.log('next state button element: ', nextStateBtn);
}

function inactivateNextStateBtn() {
    console.log('inactivateNextStateBtn has run');
    renderNextStateBtn('Inactive', 'none', 'black');
    nextStateBtnController.abort();
    nextStateBtnController = new AbortController();

}

function findMonsterEl(subMonsterEl) {
    // Several different section hierarchy possibilities exist.
    if (subMonsterEl.nodeName === 'SECTION') {
        // The variable passed in is one node too high. Return that this node is too high, so that the click listener may be reactivated.
        if (subMonsterEl.id === 'inactivePlayerMonsters' || subMonsterEl.id === 'activePlayerMonsters') {
            return "too high";
        }
        // The variable passed in is one node below the node that we want.
        else if (subMonsterEl.class === 'monsterImage') {
            return subMonsterEl.parentNode;
        }
        // The variable passed in is the element we want.
        else {
            return subMonsterEl;
        }
    }
    // Only one paragraph hierarchy possiblity exists.
    else if (subMonsterEl.nodeName === 'P') {
        // The variable passed in is one node below the node that we want.
        return subMonsterEl.parentNode;
    }
    else if (subMonsterEl.nodeName === 'IMG') {
        // The variable passed in is two nodes below the node that we want.
        return subMonsterEl.parentNode.parentNode;
    }
    else if (subMonsterEl.nodeName === 'SPAN') {
        // The variable passed in is two nodes below the node that we want.
        return subMonsterEl.parentNode.parentNode;
    }
    else {
        console.log("The clicked monsterEl does not have a nodeName that is handled in findMonsterEl. The clicked monsterEl node name is: ", subMonsterEl.nodeName);
    }
}

// #endregion