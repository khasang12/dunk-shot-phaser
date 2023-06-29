import { BASKET_EFFECTS, CANVAS_HEIGHT, CANVAS_WIDTH, SPEED_LIMIT } from '../../../constants'
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
import { BASKET_TWEENS_MOVING, BASKET_TWEENS_ROTATING, BASKET_TWEENS_VIBRATING } from './config'

export default class Basket extends BodyObject {
    public stateMachine: StateMachine
    public bodyGroup: Phaser.Physics.Arcade.Group
    public edgeGroup: Phaser.Physics.Arcade.Group
    public openGroup: Phaser.Physics.Arcade.Group
    public edgeRects: Phaser.GameObjects.Rectangle[]
    public openRects: Phaser.GameObjects.Rectangle[]
    public bodyRects: Phaser.GameObjects.Rectangle[]
    private tweensX: Phaser.Tweens.Tween
    private tweensY: Phaser.Tweens.Tween
    private tweensAngle: Phaser.Tweens.Tween
    private newY: number

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
        const config = {
            allowGravity: false,
            immovable: true,
            visible: false,
        }

        this.bodyRects = [
            this.scene.add.rectangle(this.x - edge, this.y, edge, edge),
            this.scene.add.rectangle(this.x, this.y, edge, edge),
            this.scene.add.rectangle(this.x + edge, this.y, edge, edge),
        ]

        this.edgeRects = [
            this.scene.add.rectangle(this.x - 70, this.y - 15, 5, 5),
            this.scene.add.rectangle(this.x + 70, this.y - 15, 5, 5),
        ]

        this.openRects = [
            this.scene.add.rectangle(this.x - 25, this.y - 25, 20, 35),
            this.scene.add.rectangle(this.x + 25, this.y - 25, 20, 35),
        ]

        this.bodyGroup = this.scene.physics.add.group(config)
        this.openGroup = this.scene.physics.add.group(config)

        this.edgeGroup = this.scene.physics.add.group({
            ...config,
            bounceX: 0.02,
            bounceY: 0.02,
        })

        this.bodyGroup.addMultiple(this.bodyRects)
        this.edgeGroup.addMultiple(this.edgeRects)
        this.openGroup.addMultiple(this.openRects)
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

    private updateOpenGroup() {
        const alpha = getAngCoeff(this.width, this.height)
        const l = (getHypot(this.width, this.height) * (this.scale - 0.3)) / 4
        this.openGroup.setX(
            this.x - getProjectX(l, -this.rotation - alpha),
            getProjectX(l, -this.rotation + alpha) + getProjectX(l, -this.rotation - alpha)
        )
        this.openGroup.setY(
            this.y + getProjectY(l, -this.rotation - alpha),
            -getProjectY(l, -this.rotation + alpha) - getProjectY(l, -this.rotation - alpha)
        )
    }

    private transition(
        obj: Phaser.Physics.Arcade.Sprite,
        destX: number,
        destY: number,
        edgeCollide: boolean,
        effect?: number
    ) {
        this.scene.tweens.add({
            targets: obj,
            x: destX,
            y: destY,
            duration: 1000,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                this.updateBodyGroup()
                this.updateEdgeGroup()
                if (edgeCollide) {
                    this.updateOpenGroup()
                    if (effect == BASKET_EFFECTS['ROTATE']) this.addRotating()
                    else if (effect == BASKET_EFFECTS['MOVE_X']) this.addMovingX()
                    else if (effect == BASKET_EFFECTS['MOVE_Y']) this.addMovingY()
                }
            },
        })
    }

    public onTransitEnter(data: number[]) {
        const [_W, H] = [CANVAS_WIDTH, CANVAS_HEIGHT]
        const [state, effect, curHeight] = data
        if (state == 0) this.transition(this, this.x, this.y, false, effect)
        else {
            this.newY = curHeight - randomIntegerInRange(H / 4, H / 3)
            this.transition(this, this.x, this.newY, true, effect)
        }
    }

    public onIdleEnter() {
        this.clearEffect()
        this.scene.tweens.add({
            targets: this,
            scaleY: this.scaleX,
            duration: 5000,
            ease: 'Power2',
        })
        this.updateEdgeGroup()
    }

    public onSnipeEnter(data: number[]) {
        const [velocity, angle] = data
        this.rotation = angle - Math.PI / 2
        this.setScale(
            this.scaleX,
            Math.max(
                (this.scaleX * 1.3 * Math.min(velocity, SPEED_LIMIT)) / SPEED_LIMIT,
                this.scaleX * 1.2
            )
        )
        this.updateEdgeGroup()
    }

    public moveFollower(obj: Ball | Star | null) {
        const [W, _H] = [CANVAS_WIDTH, CANVAS_HEIGHT]
        if (obj instanceof Ball) {
            this.transition(obj, this.x, this.y, false)
            this.clearEffect()
        } else if (obj instanceof Star) {
            if (this.x > W / 2) {
                this.setRotation(-randomAngle() / 2)
            } else {
                this.setRotation(randomAngle() / 2)
            }
            this.transition(
                obj,
                this.x + getProjectX(80, Math.PI / 2 - this.rotation),
                this.newY - getProjectY(80, Math.PI / 2 - this.rotation),
                false
            )
            obj.setAlpha(1)
        }
    }

    public reset() {
        this.angle = 0
    }

    public vibrateX() {
        this.scene.tweens.add({
            targets: this,
            x: this.x - 10,
            ...BASKET_TWEENS_VIBRATING,
        })
    }

    public vibrateY() {
        this.scene.tweens.add({
            targets: this,
            y: this.y - 10,
            ...BASKET_TWEENS_VIBRATING,
        })
    }

    public addMovingX() {
        this.tweensX = this.scene.tweens.add({
            targets: this,
            x: this.x - 25, // Destination position of the object
            onUpdate: () => {
                this.updateBodyGroup()
                this.updateEdgeGroup()
                this.updateOpenGroup()
            },
            ...BASKET_TWEENS_MOVING,
        })
    }

    public addMovingY() {
        this.tweensY = this.scene.tweens.add({
            targets: this,
            y: this.y + 30,
            onUpdate: () => {
                this.updateBodyGroup()
                this.updateEdgeGroup()
                this.updateOpenGroup()
            },
            ...BASKET_TWEENS_MOVING,
        })
    }

    public addRotating() {
        this.tweensAngle = this.scene.tweens.add({
            targets: this,
            onUpdate: () => {
                this.updateBodyGroup()
                this.updateEdgeGroup()
                this.updateOpenGroup()
            },
            ...BASKET_TWEENS_ROTATING,
        })
    }

    public clearEffect() {
        if (this.tweensX) this.tweensX.stop()
        if (this.tweensY) this.tweensY.stop()
        if (this.tweensAngle) this.tweensAngle.stop()
    }
}
