import { IButton } from "../../types/button"

export default class Button extends Phaser.GameObjects.Container {
    private button: Phaser.GameObjects.Sprite
    private text: Phaser.GameObjects.Text
    private scaleRatio: number
    private callback: () => void

    constructor(b: IButton) {
        super(b.scene, b.x, b.y)

        this.scaleRatio = b.scale

        // Create the button image using nine-slice scaling and add it to the container
        this.button = b.scene.add.sprite(0, 0, b.key).setInteractive()
        this.add(this.button)

        // Create the button text and add it to the container
        this.text = b.scene.add.text(0, 0, b.text, {
            color: '#ffffff',
            fontSize: '27px',
            fontFamily: 'Roboto',
            fontStyle: 'bold'
        })
        this.text.setOrigin(0.5)
        this.add(this.text)

        // Set the callback for the button click/touch events
        this.callback = b.callback

        // Add the button to the scene
        b.scene.add.existing(this)

        // Add event listeners for the button click/touch events
        this.button.on('pointerdown', this.onPointerDown, this)
        this.button.on('pointerup', this.onPointerUp, this)
        this.button.on('pointerout', this.onPointerOut, this)
        this.button.setScale(this.scaleRatio)
    }

    public onPointerDown() {
        this.button.setScale(this.scaleRatio * 0.9)
    }

    public onPointerUp() {
        this.button.setScale(this.scaleRatio)
        this.callback()
    }

    public onPointerOut() {
        this.button.setScale(this.scaleRatio)
    }
}
