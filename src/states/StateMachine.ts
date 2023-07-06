import { IState } from '../types/state'

let idCount = 0

export default class StateMachine {
    private states = new Map<string, IState>()
    private currentState?: IState
    private id = (++idCount).toString()
    private context?: object
    private isChangingState = false
    private changeStateQueue: string[]

    constructor(context?: object, id?: string) {
        this.id = id ?? this.id
        this.context = context
        this.changeStateQueue = []
    }

    public addState(
        name: string,
        config?: {
            onEnter?: (args: any[]) => void
            onUpdate?: (dt: number, args?: number[]) => void
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

    public setState(name: string, ...args: number[]) {
        // switch to State called `name`
        if (!this.states.has(name)) {
            console.warn(`Tried to change to unknown state: ${name}`)
            return
        }

        /* console.log(
            `[StateMachine (${this.id})] change from ${
                this.currentState?.name ?? 'none'
            } to ${name}`
        ) */

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

        this.currentState = <IState>this.states.get(name)

        if (this.currentState.onEnter) {
            this.currentState.onEnter(args)
        }

        this.isChangingState = false
    }

    public isCurrentState(name: string) {
        if (!this.currentState) {
            return false
        }

        return this.currentState.name === name
    }

    public update(dt: number) {
        // update current state if exists
        if (this.changeStateQueue.length > 0) {
            this.setState(<string>this.changeStateQueue.shift())
            return
        }

        if (this.currentState && this.currentState.onUpdate) {
            this.currentState.onUpdate(dt)
        }
    }
}
