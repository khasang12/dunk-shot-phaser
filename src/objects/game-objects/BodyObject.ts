import { IGameObject } from '../../types/object'

export default class BodyObject extends Phaser.Physics.Arcade.Sprite {
    constructor(o: IGameObject) {
        super(o.scene, o.x, o.y, o.key)
        this.setOrigin(0.5, 0.5)
        this.scale = o.scale ? o.scale : 1
        this.setScale(o.scale)
        this.body = this.body as Phaser.Physics.Arcade.Body
    }
}
