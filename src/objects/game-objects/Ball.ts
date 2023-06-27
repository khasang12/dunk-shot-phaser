import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../constants'
import StateMachine from '../../states/StateMachine'
import { IGameObject } from '../../types/object'
import { Point } from '../../types/point'
import { getProjectX, getProjectY } from '../../utils/math'
import BodyObject from './BodyObject'

export default class Ball extends BodyObject {
    private elapsed: number
    private isMoving: boolean
    private powerUp: boolean
    private trajectory: Point[]
    public points: Phaser.GameObjects.Graphics
    public stateMachine: StateMachine
    private smokeParticle: Phaser.GameObjects.Particles.ParticleEmitter

    constructor(o: IGameObject) {
        super(o)
        this.elapsed = 0
        this.isMoving = false
        this.powerUp = false

        this.scene.physics.add.existing(this)

        this.disableBody(true, true)
        this.body?.setCircle(this.width / 2)
        this.setBounce(0.75, 0.75)
        this.setVisible(true)
        this.setGravityY(9.8)
        this.setCollideWorldBounds(false, 1, 1, true)

        this.scene.add.existing(this)

        this.stateMachine = new StateMachine(this, 'ball')

        this.stateMachine
            .addState('idle', {
                onEnter: this.onIdleEnter,
            })
            .addState('demo', {
                onUpdate: this.onDemoUpdate,
            })
            .addState('snipe', {
                onEnter: this.onSnipeEnter,
                onExit: this.onSnipeExit,
            })
            .addState('fly', {
                onEnter: this.onFlyEnter,
                onUpdate: this.onFlyUpdate,
            })

        this.stateMachine.setState('idle')
    }

    public update(dt: number) {
        this.stateMachine.update(dt)
    }

    public onIdleEnter(data: number[]) {
        if (this.smokeParticle) this.smokeParticle.stop()
        if (data.length > 0) {
            const [x, y, score] = data
            this.emitSmokeParticle()
            if (score && score % 5 == 0 && score > 0) {
                this.powerUp = true
            }
            this.setX(x)
            this.setY(y)
            this.setVelocity(0, 0)
            this.disableBody(true, false)
            this.isMoving = false
        }
    }

    private emitSmokeParticle(): void {
        this.smokeParticle = this.scene.add.particles(100, 100, 'dot', {
            color: [0x696969, 0x808080, 0xa9a9a9, 0xf5f5f5],
            alpha: { start: 0.9, end: 0.1, ease: 'sine.easeout' },
            angle: { min: 0, max: 360 },
            rotate: { min: 0, max: 360 },
            speed: { min: 40, max: 70 },
            colorEase: 'quad.easeinout',
            lifespan: 1500,
            scale: 0.4,
            frequency: 60,
        })
        this.smokeParticle.startFollow(this, -90, -120, true)
    }

    public onDemoUpdate(delta: number) {
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

    public onFlyEnter(data: number[]) {
        const [x, y, angle, speed] = data
        if (speed > 0) {
            this.isMoving = true
            const curSpeed = speed * 7.2
            this.enableBody(true, x, y, true, true)
            this.setVelocity(getProjectX(curSpeed, angle), -getProjectY(curSpeed, angle))
            this.scene.physics.velocityFromRotation(angle, curSpeed, this.body?.velocity)
        }
    }

    public onFlyUpdate(_delta: number) {
        if (this.isMoving) this.rotation += 0.1
    }

    public onSnipeEnter(data: number[]) {
        const [power, angle] = data
        this.trajectory = []
        this.points = this.scene.add.graphics()
        this.points.fillStyle(0xffa500, 1)
        for (let i = 0; i < 6; i++) {
            const timeSlice = i * 1.5
            let x = this.x + getProjectX(power, angle) * timeSlice
            const y = this.y - getProjectY(power, angle) * timeSlice + 0.5 * 19.8 * timeSlice ** 2
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

    public onSnipeExit() {
        this.points.destroy()
    }

    public isPowerUp() {
        return this.powerUp
    }

    public disablePowerUp() {
        this.powerUp = false
    }
}
