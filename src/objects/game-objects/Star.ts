import StateMachine from '../../states/StateMachine'
import { IGameObject } from '../../types/object'
import BodyObject from './BodyObject'

export default class Star extends BodyObject {
    public stateMachine: StateMachine

    constructor(o: IGameObject) {
        super(o)

        this.setInteractive()

        this.scene.physics.add.existing(this)
        this.disableBody(false, true)
        this.setVisible(true)
        this.scene.add.existing(this)

        const fx1 = this.postFX.addGlow(0xffffff, 0, 0, false, 0.1, 24)

        this.scene.tweens.add({
            targets: fx1,
            outerStrength: 7,
            yoyo: true,
            loop: -1,
            ease: 'sine.inout',
        })

        this.scene.tweens.add({
            targets: this,
            scaleX: 0.25,
            scaleY: 0.25,
            yoyo: true,
            loop: -1,
            ease: 'sine.inout',
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
        this.enableBody(false)
    }

    public onDisableEnter() {
        this.disableBody(false)
    }
}
