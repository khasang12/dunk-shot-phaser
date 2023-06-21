export type IButton = {
    scene: Phaser.Scene
    x: number
    y: number
    key: string
    text: string
    scale: number
    callback: () => void
}