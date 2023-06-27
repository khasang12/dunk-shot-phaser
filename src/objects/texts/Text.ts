import { IText } from '../../types/text'

export class Text extends Phaser.GameObjects.Text {
    constructor(t: IText) {
        super(t.scene, t.x, t.y, t.msg, t.style)
        this.setOrigin(0.5)

        this.scene.add.existing(this)
    }

    public emitTextFadeInOut(x: number, y: number, delta: number) {
        this.setX(x)
        this.setY(y)
        this.setAlpha(1)
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 1000,
            ease: 'ease.sineInOut',
            onComplete: () => {
                this.setAlpha(0)
            },
        })
    }
}
