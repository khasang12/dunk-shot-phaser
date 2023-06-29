import StateMachine from '../../../states/StateMachine'
import { IGameObject } from '../../../types/object'
import BodyObject from '../BodyObject'
import { STAR_TWEENS_GLOW } from './config'

export default class Star extends BodyObject {
    public stateMachine: StateMachine

    constructor(o: IGameObject) {
        super(o)

        this.setInteractive()

        this.scene.physics.add.existing(this)
        this.disableBody(false, true)
        this.setVisible(true)
        this.scene.add.existing(this)

        this.scene.tweens.add({
            targets: this,
            ...STAR_TWEENS_GLOW,
        })

        this.stateMachine = new StateMachine(this, 'ball')

        this.stateMachine
            .addState('enable', {
                onEnter: this.onEnableEnter,
            })
            .addState('disable', {
                onEnter: this.onDisableEnter,
            })

        this.stateMachine.setState('disable')
    }

    public onEnableEnter() {
        if (this.visible == false) {
            this.enableBody(false)
            this.setVisible(true)
        }
    }

    public onDisableEnter() {
        if (this.visible == true) {
            this.disableBody(false)
            this.setVisible(false)
        }
    }
}
