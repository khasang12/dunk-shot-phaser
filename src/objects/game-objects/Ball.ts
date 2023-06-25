import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../constants'
import { IGameObject } from '../../types/object'
import { Point } from '../../types/point'
import { getProjectX, getProjectY } from '../../utils/math'
import BodyObject from './BodyObject'

export default class Ball extends BodyObject {
    private elapsed: number
    private isMoving: boolean
    private trajectory: Point[]
    public points: Phaser.GameObjects.Graphics

    constructor(o: IGameObject) {
        super(o)
        this.elapsed = 0
        this.isMoving = false

        this.scene.physics.add.existing(this)

        this.disableBody(true, true)
        this.body?.setCircle(this.width / 2)
        this.setBounce(1, 1)
        this.setVisible(true)
        this.setGravityY(9.8)
        this.setCollideWorldBounds(false, 1, 1, true)

        this.scene.add.existing(this)
    }

    public getIsMoving() {
        return this.isMoving
    }

    public flyDemo(time: number, delta: number) {
        const startPoint = { x: 110, y: CANVAS_HEIGHT - 180 }
        const endPoint = { x: CANVAS_WIDTH - 140, y: CANVAS_HEIGHT / 2 + 30 }
        const apexPoint = { x: 200, y: 0 }
        const duration = 3500

        this.rotation += 0.05

        // Calculate the position of the sprite along the parabolic trajectory
        let t = ((this.elapsed / duration) * delta) / 16
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
        if (speed > 0) {
            this.isMoving = true
            const curSpeed = speed * 7.2
            this.enableBody(true, x, y, true, true)
            this.setVelocity(getProjectX(curSpeed, angle), -getProjectY(curSpeed, angle))
            console.log(this.body?.velocity)
            this.scene.physics.velocityFromRotation(angle, curSpeed, this.body?.velocity)
        }
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

    public changeSkin(key: string) {
        this.setTexture(key)
    }

    public setTrajectory(power: number, angle: number) {
        this.trajectory = []
        this.points = this.scene.add.graphics()
        this.points.fillStyle(0xffa500, 1)
        for (let i = 0; i < 6; i++) {
            const timeSlice = i * 1.5
            let x = this.x + getProjectX(power, angle) * timeSlice
            const y = this.y - getProjectY(power, angle) * timeSlice + 0.5 * 20 * timeSlice ** 2
            if (x < 0) x = -x // symmetric
            else if (x > CANVAS_WIDTH) x = CANVAS_WIDTH - (x - CANVAS_WIDTH)
            this.trajectory.push({ x, y })
        }
        // Loop through each point in the trajectory and draw a circle at that position
        for (let i = 0; i < 6; i++) {
            const point = this.trajectory[i]
            this.points.fillCircle(point.x, point.y, 12 - i)
        }
    }
}
