import { IGameState } from '../types/state'

let idCount = 0

export default class GameStateMachine {
    private states = new Map<string, IGameState>()
    private currentState?: IGameState
    private id = (++idCount).toString()
    private context?: object
    private isChangingState = false
    private changeStateQueue: string[]

    constructor(context?: object, id?: string) {
        this.id = id ?? this.id
        this.context = context
        this.changeStateQueue = []
    }

    addState(
        name: string,
        config?: {
            onEnter?: (arg: Phaser.Scene, msg?: Object) => void
            onUpdate?: (dt: number) => void
            onExit?: () => void
        }
    ) {
        // add a new State
        const context = this.context

        this.states.set(name, {
            name,
            onEnter: config?.onEnter?.bind(context),
            onUpdate: config?.onUpdate?.bind(context),
            onExit: config?.onExit?.bind(context),
        })

        return this
    }

    setState(name: string, args: Phaser.Scene, msg?: Object) {
        // switch to State called `name`
        if (!this.states.has(name)) {
            console.warn(`Tried to change to unknown state: ${name}`)
            return
        }

        if (this.currentState?.name == name) return

        if (this.isChangingState) {
            this.changeStateQueue.push(name)
            console.log(
                `[StateMachine (${this.id})] change from ${
                    this.currentState?.name ?? 'none'
                } to ${name}`
            )
            return
        }

        this.isChangingState = true

        if (this.currentState && this.currentState.onExit) {
            this.currentState.onExit()
        }

        this.currentState = <IGameState>this.states.get(name)

        if (this.currentState.onEnter) {
            if (msg) this.currentState.onEnter(args, msg)
            else this.currentState.onEnter(args)
        }

        this.isChangingState = false
    }

    isCurrentState(name: string) {
        if (!this.currentState) {
            return false
        }

        return this.currentState.name === name
    }

    update(dt: number, arg: Phaser.Scene) {
        // update current state if exists
        if (this.changeStateQueue.length > 0) {
            this.setState(<string>this.changeStateQueue.shift(), arg)
            return
        }

        if (this.currentState && this.currentState.onUpdate) {
            this.currentState.onUpdate(dt)
        }
    }
}
