import { IBodyGroup } from '../../types/body-group'

export default class BodyLineGroup extends Phaser.Physics.Arcade.Group {
    constructor(bl: IBodyGroup) {
        super(bl.world, bl.scene, bl.config)
        this.scene.physics.add.group(this)
        this.scene.add.existing(this)
    }
}
