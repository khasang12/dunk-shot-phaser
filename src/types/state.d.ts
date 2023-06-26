export interface IState {
    name: string
    onEnter?: (args: number[]) => void
    onUpdate?: (dt: number) => void
    onExit?: () => void
}
