import { ITileSprite } from '../../types/tile'

export default class Background extends Phaser.GameObjects.TileSprite {
    protected scaleRatio: number

    constructor(i: ITileSprite) {
        super(i.scene, i.x, i.y, i.w, i.h, i.key)

        this.scaleRatio = i.scale ? i.scale : 1
        this.setScale(this.scaleRatio)

        // Add the image to the scene
        i.scene.add.existing(this)
    }
}
