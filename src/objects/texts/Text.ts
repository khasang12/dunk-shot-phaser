import { IText } from '../../types/text'

export class Text extends Phaser.GameObjects.Text {
    constructor(t: IText) {
        super(t.scene, t.x, t.y, t.msg, t.style)
        this.setOrigin(0.5)

        this.scene.add.existing(this)
    }
}
