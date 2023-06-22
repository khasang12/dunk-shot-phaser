import { IGameObject } from '../../types/object'
import BodyObject from './BodyObject'

export default class Star extends BodyObject {
    constructor(o: IGameObject) {
        super(o)

        this.setInteractive()

        this.scene.physics.add.existing(this)
        this.disableBody(true, true)
        this.setVisible(true)
        this.scene.add.existing(this)
    }
}
