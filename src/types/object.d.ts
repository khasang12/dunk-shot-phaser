export type IGameObject = {
    scene: Phaser.Scene
    x: number
    y: number
    key: string
    scale?: number
    callback?: (x: number, y: number, a: number, b: number) => void
}
