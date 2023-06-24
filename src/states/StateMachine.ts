import { deepCopy } from '../utils/object'
import BaseState from './BaseState'

export default class StateMachine {
    private state: string
    private initialState: string
    private possibleStates: Map<string, BaseState>
    private stateArgs: [Phaser.Scene, Phaser.Physics.Arcade.Sprite]

    constructor(
        initialState: string,
        possibleStates: Map<string, BaseState>,
        stateArgs: [Phaser.Scene, Phaser.Physics.Arcade.Sprite]
    ) {
        this.initialState = initialState
        this.possibleStates = possibleStates
        this.stateArgs = stateArgs
        this.state = ''

        // State instances get access to the state machine via this.stateMachine.
        for (const state of Object.values(this.possibleStates)) {
            state.stateMachine = this
        }
    }

    public step() {
        // On the first step, the state is null and we need to initialize the first state.
        if (this.state === '') {
            this.state = this.initialState
            this.possibleStates
                .get(this.state)
                ?.enter(deepCopy(this.stateArgs[0]), deepCopy(this.stateArgs[1]))
        }

        // Run the current state's execute
        this.possibleStates
            .get(this.state)
            ?.execute(deepCopy(this.stateArgs[0]), deepCopy(this.stateArgs[1]))
    }

    public transition(newState: string) {
        this.state = newState
        this.possibleStates
            .get(this.state)
            ?.enter(deepCopy(this.stateArgs[0]), deepCopy(this.stateArgs[1]))
    }
}
