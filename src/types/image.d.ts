export type IImage = {
    scene: Phaser.Scene
    x: number
    y: number
    key: string
    scale?: number
    frame?: number
}

export type IClickableImage = {
    scene: Phaser.Scene
    x: number
    y: number
    key: string
    callback: () => void
    scale?: number
    frame?: number
}