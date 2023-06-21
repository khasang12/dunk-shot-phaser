import { IImage } from '../../types/image'

export default class Image extends Phaser.GameObjects.Image {
    protected scaleRatio: number

    constructor(i: IImage) {
        super(i.scene, i.x, i.y, i.key, i.frame)

        this.scaleRatio = i.scale ? i.scale : 1
        this.setScale(this.scaleRatio)

        // Add the image to the scene
        i.scene.add.existing(this)
    }
}
