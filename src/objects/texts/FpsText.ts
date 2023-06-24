import { CANVAS_WIDTH } from '../../constants'

export default class FpsText extends Phaser.GameObjects.Text {
    constructor(scene: Phaser.Scene) {
        super(scene, CANVAS_WIDTH / 2 - 40, 20, '', { color: '#ffa500', fontSize: '28px', fontStyle: 'bold'})
        scene.add.existing(this)
        this.setOrigin(0)
    }

    public update() {
        this.setText(`fps: ${Math.floor(this.scene.game.loop.actualFps)}`)
    }
}
