import Enemy from '../characters/Enemy'

export default class StateMachine{

    context : Enemy;
    states : Array<string>;
    state : string;


    constructor(context, initialState, states){

        this.context = context;           // The object (e.g., player) using the state machine
        this.states = states;             // Dictionary of states
        this.state = '';
        this.changeState(initialState);
    }

    changeState(newState) {
        if (this.state && this.states[this.state].exit) {
            this.states[this.state].exit.call(this.context);
        }

        this.state = newState;

        if (this.states[this.state].enter) {
            this.states[this.state].enter.call(this.context);
        }
    }

    update(dt) {
        if (this.states[this.state].update) {
            this.states[this.state].update.call(this.context, dt);
        }
        
    }


}