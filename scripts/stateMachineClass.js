class StateMachine {
    constructor(states = Array(0), currentState = null) {
        this.states = states;
        this.currentState = currentState;
    }

    advanceState(targetState) {
        for (let i = 0; i < this.currentState.getConnectedStates.length; i++) {
            if (targetState === this.currentState.getConnectedStates[i]) {
                setCurrentState(this.currentState.getConnectedStates[i]);
            }
            else {
                console.log("State advancement error. Invalid target state. Not contained within the current state's connected states.");
            }
        }
    }

    setCurrentState(targetState) {
        this.currentState = targetState;
    }

    addState(state) {
        this.states = [...this.states, state];
    }

    removeState(state) {
        for (let i = 0; i < this.states.length; i++) {
            if (state === this.states[i]) {
                this.states.splice(i, 1);
            }
        }
    }
}

class State {
    constructor(stateName, renderStateFunc, connectedStates = Array(0)) {
        this.stateName = stateName;
        this.connectedStates = connectedStates;
        this.renderStateFunc = renderStateFunc;
    }

    addConnectedStates(stateArr) {
        this.connectedStates = [...this.connectedStates, ...stateArr];
    }

    removeConnectedState(state) {
        for (let i = 0; i < this.connectedStates.length; i++) {
            if (state === this.connectedStates[i]) {
                this.connectedStates.splice(i, 1);
            }
            else {
                console.log("State removal error. Cannot remove an state that is not already connected.");
            }
        }
    }

    getConnectedStates() {
        return this.connectedStates;
    }
}