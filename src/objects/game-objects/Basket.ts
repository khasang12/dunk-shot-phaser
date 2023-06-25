import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../constants'
import { IGameObject } from '../../types/object'
import Ball from './Ball'
import BodyObject from './BodyObject'
import Star from './Star'

export default class Basket extends BodyObject {
    public bodyGroup: Phaser.Physics.Arcade.Group
    public edgeGroup: Phaser.Physics.Arcade.Group
    public edgeLeft: Phaser.GameObjects.Rectangle
    public edgeRight: Phaser.GameObjects.Rectangle

    constructor(o: IGameObject) {
        super(o)

        this.createMultiBody()
        this.scene.physics.add.existing(this)

        this.disableBody(true, false)
        this.scene.add.existing(this)
    }

    private createMultiBody() {
        this.bodyGroup = this.scene.physics.add.group({
            allowGravity: false,
            immovable: true,
            visible: false,
            collideWorldBounds: false,
        })
        const edge = 40

        const rect1 = this.scene.add.rectangle(this.x - edge, this.y, edge, edge)
        const rect2 = this.scene.add.rectangle(this.x, this.y, edge, edge)
        const rect3 = this.scene.add.rectangle(this.x + edge, this.y, edge, edge)

        this.bodyGroup.add(rect1)
        this.bodyGroup.add(rect2)
        this.bodyGroup.add(rect3)
        this.bodyGroup.setActive(false)

        this.edgeGroup = this.scene.physics.add.group({
            allowGravity: false,
            immovable: true,
            visible: false,
            collideWorldBounds: true,
            bounceX: 0.2,
            bounceY: 0.2,
        })
        this.edgeLeft = this.scene.add.rectangle(this.x - 70, this.y - 20, 5, 5)
        this.edgeRight = this.scene.add.rectangle(this.x + 70, this.y - 20, 5, 5)

        this.addEdgeGroup()
    }

    private addEdgeGroup() {
        this.edgeGroup.add(this.edgeLeft)
        this.edgeGroup.add(this.edgeRight)
        this.edgeGroup.setActive(false)
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
                console.log('Object move complete!')

                this.bodyGroup.setX(
                    this.x - 40 * Math.cos(this.rotation),
                    40 * Math.cos(this.rotation)
                )
                this.bodyGroup.setY(
                    this.y - 40 * Math.sin(this.rotation),
                    40 * Math.sin(this.rotation)
                )

                const alpha = Math.atan2(this.height, this.width)
                const l = (Math.sqrt(this.width ** 2 + this.height ** 2) * (this.scale - 0.1)) / 2

                if (edgeCollide) {
                    this.addEdgeGroup()
                    this.edgeGroup.setX(
                        this.x - l * Math.cos(-this.rotation - alpha),
                        l * Math.cos(-this.rotation + alpha) + l * Math.cos(-this.rotation - alpha)
                    )
                    this.edgeGroup.setY(
                        this.y + l * Math.sin(-this.rotation - alpha),
                        -l * Math.sin(-this.rotation + alpha) - l * Math.sin(-this.rotation - alpha)
                    )
                } else {
                    this.edgeGroup.clear()
                }
            },
        })
    }

    public resetPosition(obj: Ball | Star | null) {
        const newY =
            this.y > CANVAS_HEIGHT / 2
                ? Math.floor(Math.random() * (CANVAS_HEIGHT / 2 - 200 + 1)) + 200
                : Math.floor(Math.random() * (CANVAS_HEIGHT - 100 - CANVAS_HEIGHT / 2 + 1)) +
                  CANVAS_HEIGHT / 2

        if (obj instanceof Ball) {
            this.transition(this, this.x, newY, false)
            this.transition(obj, this.x, newY, false)
        } else if (obj instanceof Star) {
            this.transition(this, this.x, newY, true)
            let angle = 0
            if (this.x > CANVAS_WIDTH / 2) {
                angle = -(Math.random() * Math.PI) / 2
            } else {
                angle = (Math.random() * Math.PI) / 2
            }
            this.setRotation(angle)
            this.transition(
                obj,
                this.x + 80 * Math.sin(this.rotation),
                newY - 80 * Math.cos(this.rotation),
                false
            )
            obj.setAlpha(1)
        }
    }

    public reset() {
        this.angle = 0
    }
}
