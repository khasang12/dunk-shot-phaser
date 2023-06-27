export interface IState {
    name: string
    onEnter?: (args: number[]) => void
    onUpdate?: (dt: number) => void
    onExit?: () => void
}

export interface IGameState {
    name: string
    onEnter?: (arg: Phaser.Scene, msg?: Object) => void
    onUpdate?: (dt: number) => void
    onExit?: () => void
}
