import { IClickableImage } from '../../types/image'
import Image from './Image'

export default class ClickableImage extends Image {
    private callback: () => void

    constructor(i: IClickableImage) {
        super(i)

        // Enable input events for the image
        this.setInteractive()

        // Add event listeners for the image click/touch events
        this.on('pointerdown', this.onPointerDown, this)
        this.on('pointerup', this.onPointerUp, this)
        this.on('pointerout', this.onPointerOut, this)

        this.setScale(this.scaleRatio)
        this.callback = i.callback
    }

    public onPointerDown() {
        this.setScale(this.scaleRatio * 0.9)
    }

    public onPointerUp() {
        this.setScale(this.scaleRatio)
        this.callback()
    }

    public onPointerOut() {
        this.setScale(this.scaleRatio)
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
}
