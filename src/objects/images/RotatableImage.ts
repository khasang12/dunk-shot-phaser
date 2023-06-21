import { IClickableImage } from '../../types/image'
import Image from './Image'

export default class RotatableImage extends Image {
    private callback: () => void

    constructor(i: IClickableImage) {
        super(i)

        // Enable input events for the image
        this.setInteractive()

        // Add event listeners for the image click/touch events
        this.on('pointerdown', this.onPointerMove, this)
        this.on('pointerup', this.onPointerUp, this)

        this.setScale(this.scaleRatio)
        this.callback = i.callback
    }

    public onPointerMove() {
        this.setScale(this.scaleRatio * 0.9)
        this.scene.input.on('pointermove', this.rotateSprite, this)
    }

    public onPointerUp() {
        this.setScale(this.scaleRatio)
        this.scene.input.off('pointermove', this.rotateSprite, this)
    }

    public enableOscillator() {
        // Create a tween to oscillate the image's scale
        this.scene.tweens.add({
            targets: this,
            scaleX: 0.25,
            scaleY: 0.25,
            yoyo: true,
            repeat: -1,
            duration: 1000,
            ease: 'Quad.easeInOut',
        })
    }

    public rotateSprite(pointer: Phaser.Input.Pointer) {
        const dist = Phaser.Math.Distance.BetweenPoints(this, pointer)

        if (dist < 50) {
            // Calculate the angle between the sprite and the mouse pointer
            const angle = Phaser.Math.Angle.BetweenPoints(this, pointer)

            // Set the rotation of the sprite to the calculated angle
            this.setRotation(angle)
        }
        else{
            this.onPointerUp()
        }
    }
}
