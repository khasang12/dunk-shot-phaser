export default class SmokeEffect extends Phaser.GameObjects.Graphics {
    private radius: number

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, { x: x, y: y })

        this.radius = 40
        this.alpha = 1

        scene.add.existing(this)
    }

    public emitSmoke(x: number, y: number, color: number) {
        this.clear()
        this.setX(x)
        this.setY(y)
        // Draw the circle
        this.fillStyle(color, this.alpha)
        this.fillCircle(0, 0, this.radius)

        // Create tweens to animate the smoke effect
        const alphaTween = this.scene.tweens.add({
            targets: this,
            y: this.y - 75,
            alpha: 0,
            duration: 500,
        })

        const scaleTween = this.scene.tweens.add({
            targets: this,
            scaleX: 3,
            scaleY: 0.3,
            y: this.y - 75,
            ease: 'Quad.easeOut',
            duration: 300,
            onComplete: () => {
                this.destroy()
            },
        })
    }
}
