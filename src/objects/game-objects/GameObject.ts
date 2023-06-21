import { IGameObject } from '../../types/object'

export default class GameObject extends Phaser.GameObjects.Sprite {
    constructor(o: IGameObject) {
        super(o.scene, o.x, o.y, o.key)
        this.setOrigin(0.5, 0.5)
        this.scale = o.scale ? o.scale : 1
        this.setScale(o.scale)

        this.scene.add.existing(this)
    }
}
