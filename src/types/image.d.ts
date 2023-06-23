export type IImage = {
    scene: Phaser.Scene
    x: number
    y: number
    key: string
    scale?: number
    frame?: number
}

export type IClickableImage = Image & { callback: () => void }
