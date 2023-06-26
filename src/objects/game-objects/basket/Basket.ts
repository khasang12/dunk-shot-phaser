import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../../constants'
import StateMachine from '../../../states/StateMachine'
import { IGameObject } from '../../../types/object'
import {
    getAngCoeff,
    getHypot,
    getProjectX,
    getProjectY,
    randomAngle,
    randomIntegerInRange,
} from '../../../utils/math'
import Ball from '../ball/Ball'
import BodyObject from '../BodyObject'
import Star from '../star/Star'

export default class Basket extends BodyObject {
    public stateMachine: StateMachine
    public bodyGroup: Phaser.Physics.Arcade.Group
    public edgeGroup: Phaser.Physics.Arcade.Group
    public edgeRects: Phaser.GameObjects.Rectangle[]
    public bodyRects: Phaser.GameObjects.Rectangle[]

    constructor(o: IGameObject) {
        super(o)

        this.createMultiBody()
        this.scene.physics.add.existing(this)

        this.disableBody(true, false)
        this.scene.add.existing(this)

        this.stateMachine = new StateMachine(this, 'ball')

        this.stateMachine
            .addState('idle', {
                onEnter: this.onIdleEnter,
            })
            .addState('snipe', {
                onEnter: this.onSnipeEnter,
            })
            .addState('transit', {
                onEnter: this.onTransitEnter,
            })

        this.stateMachine.setState('idle')
    }

    private createMultiBody() {
        const edge = 40

        this.bodyRects = [
            this.scene.add.rectangle(this.x - edge, this.y, edge, edge),
            this.scene.add.rectangle(this.x, this.y, edge, edge),
            this.scene.add.rectangle(this.x + edge, this.y, edge, edge),
        ]

        this.edgeRects = [
            this.scene.add.rectangle(this.x - 70, this.y - 25, 5, 5),
            this.scene.add.rectangle(this.x + 70, this.y - 25, 5, 5),
            this.scene.add.rectangle(this.x + edge, this.y, edge, edge),
        ]

        this.bodyGroup = this.scene.physics.add.group({
            allowGravity: false,
            immovable: true,
            visible: false,
        })

        this.edgeGroup = this.scene.physics.add.group({
            allowGravity: false,
            immovable: true,
            visible: false,
            bounceX: 0.02,
            bounceY: 0.02,
        })

        this.addBodyGroup()
        this.addEdgeGroup()
    }

    private addBodyGroup() {
        for (const body of this.bodyRects) this.bodyGroup.add(body)
        this.bodyGroup.setActive(false)
    }

    private addEdgeGroup() {
        for (const body of this.edgeRects) this.edgeGroup.add(body)
        this.edgeGroup.setActive(false)
    }

    private updateBodyGroup() {
        const projX = getProjectX(40, this.rotation)
        const projY = getProjectY(40, this.rotation)
        this.bodyGroup.setX(this.x - projX, projX)
        this.bodyGroup.setY(this.y - projY, projY)
    }

    private updateEdgeGroup() {
        const alpha = getAngCoeff(this.width, this.height)
        const l = (getHypot(this.width, this.height) * (this.scale - 0.1)) / 2
        this.edgeGroup.setX(
            this.x - getProjectX(l, -this.rotation - alpha),
            getProjectX(l, -this.rotation + alpha) + getProjectX(l, -this.rotation - alpha)
        )
        this.edgeGroup.setY(
            this.y + getProjectY(l, -this.rotation - alpha),
            -getProjectY(l, -this.rotation + alpha) - getProjectY(l, -this.rotation - alpha)
        )
    }

    private transition(
        obj: Phaser.Physics.Arcade.Sprite,
        destX: number,
        destY: number,
        edgeCollide: boolean
    ) {
        this.scene.tweens.add({
            targets: obj,
            x: destX,
            y: destY,
            duration: 1000,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                this.updateBodyGroup()
                if (edgeCollide) {
                    this.addEdgeGroup()
                    this.updateEdgeGroup()
                } else {
                    this.edgeGroup.clear()
                }
            },
        })
    }

    public onTransitEnter() {
        const [_W, H] = [CANVAS_WIDTH, CANVAS_HEIGHT]
        const newY =
            this.y > H / 2
                ? randomIntegerInRange(200, H / 2 - 200)
                : randomIntegerInRange(H / 2, H - 100)
        this.y = newY
        this.transition(this, this.x, newY, true)
    }

    public onIdleEnter() {
        this.setScale(this.scaleX, this.scaleX)
        this.setRotation(0)
    }

    public onSnipeEnter(data: number[]) {
        const [angle] = data
        this.rotation = angle - Math.PI / 2
        this.setScale(this.scaleX, Math.min(this.scaleY * 1.2, 0.9))
    }

    public resetPositionByBasketPosition(obj: Ball | Star | null) {
        const [W, _H] = [CANVAS_WIDTH, CANVAS_HEIGHT]
        if (obj instanceof Ball) {
            this.transition(obj, this.x, this.y, false)
        } else if (obj instanceof Star) {
            if (this.x > W / 2) {
                this.setRotation(-randomAngle() / 2)
            } else {
                this.setRotation(randomAngle() / 2)
            }
            this.transition(
                obj,
                this.x + getProjectX(80, Math.PI / 2 - this.rotation),
                this.y - getProjectY(80, Math.PI / 2 - this.rotation),
                false
            )
            obj.setAlpha(1)
        }
    }

    public reset() {
        this.angle = 0
    }
}
