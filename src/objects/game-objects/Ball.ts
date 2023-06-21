import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../constants'
import { IGameObject } from '../../types/object'
import BodyObject from './BodyObject'

export default class Ball extends BodyObject {
    private elapsed: number
    private isMoving: boolean

    constructor(o: IGameObject) {
        super(o)
        this.elapsed = 0
        this.isMoving = false

        this.body?.setCircle(this.width / 2)

        this.scene.physics.add.existing(this)

        this.disableBody(true, true)

        this.setVisible(true)

        this.setCollideWorldBounds(true, 1, 0, true)
        this.setGravityY(200)
        this.setMass(5)

        this.scene.add.existing(this)
    }

    public getIsMoving() {
        return this.isMoving
    }

    public flyDemo() {
        const startPoint = { x: 110, y: CANVAS_HEIGHT - 180 }
        const endPoint = { x: CANVAS_WIDTH - 140, y: CANVAS_HEIGHT / 2 + 30 }
        const apexPoint = { x: 200, y: 0 }
        const duration = 3500

        this.rotation += 0.05

        // Calculate the position of the sprite along the parabolic trajectory
        let t = this.elapsed / duration
        const x =
            startPoint.x +
            t * (2 * (1 - t) * (apexPoint.x - startPoint.x) + t * (endPoint.x - startPoint.x))
        const y =
            startPoint.y +
            t * (2 * (1 - t) * (apexPoint.y - startPoint.y) + t * (endPoint.y - startPoint.y))

        // Set the position of the sprite
        this.x = x
        this.y = y

        if (x >= endPoint.x && y >= endPoint.y) {
            t = 0
            this.elapsed = 0
        }
        this.elapsed += this.scene.game.loop.delta
    }

    public fly(x: number, y: number, angle: number, speed: number) {
        this.isMoving = true
        this.rotation += 0.5
        const curSpeed = Math.max(50, speed * 35)
        this.enableBody(true, x, y, true, true)
        this.setVelocity(curSpeed * Math.cos(angle), -curSpeed * Math.sin(angle))
        this.scene.physics.velocityFromRotation(-angle, curSpeed, this.body?.velocity)
    }

    public resetPosition(x: number, y: number) {
        this.setX(x)
        this.setY(y)
        this.setVelocity(0, 0)
        this.reset()
        this.isMoving = false
    }

    public reset() {
        this.disableBody(true, false)
    }
}
