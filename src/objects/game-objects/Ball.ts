import { CANVAS_HEIGHT, CANVAS_WIDTH, COLLISION_EVENTS, SPEED_LIMIT } from '../../constants'
import SmokeEffect from '../../effects/SmokeEffect'
import { gameManager } from '../../game'
import StateMachine from '../../states/StateMachine'
import { IGameObject } from '../../types/object'
import IObserver from '../../types/observer'
import { Point } from '../../types/point'
import { getHypot, getProjectX, getProjectY } from '../../utils/math'
import BodyObject from './BodyObject'

export default class Ball extends BodyObject implements IObserver {
    private origin: Point
    private speed: number
    private radian: number
    private elapsed: number
    private isMoving: boolean
    private powerUp: boolean
    private trajectory: Point[]
    public points: Phaser.GameObjects.Graphics
    public stateMachine: StateMachine
    private smokeParticle: Phaser.GameObjects.Particles.ParticleEmitter
    private flameParticle: Phaser.GameObjects.Particles.ParticleEmitter
    private smokeLaunch: SmokeEffect

    constructor(o: IGameObject) {
        super(o)

        this.elapsed = 0
        this.isMoving = false
        this.powerUp = false
        this.origin = { x: this.x, y: this.y }

        this.scene.physics.add.existing(this)

        this.disableBody(true, true)
        this.body?.setCircle(this.width / 2)
        this.setBounce(0.75, 0.75)
        this.setVisible(true)
        this.setGravityY(980)
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

        this.stateMachine.setState('snipe')
    }

    public update(dt: number) {
        this.stateMachine.update(dt)
    }

    public onIdleEnter(data: number[]) {
        if (data.length > 0) {
            const [x, y, score] = data
            if (score && score % 5 == 0 && score > 0 && this.powerUp == false) {
                this.powerUp = true
            }
            this.setX(x)
            this.setY(y)
            this.origin = { x: x, y: y }
            this.setVelocity(0, 0)
            this.disableBody(true, false)
            this.isMoving = false
        }
    }

    public emitSmokeParticle(): void {
        this.smokeParticle = this.scene.add.particles(100, 100, 'dot', smokeParticleConfig)
        this.smokeParticle.startFollow(this, -90, -120, true)
    }

    public disableSmoke() {
        this.smokeParticle.stop()
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
        const [x, y] = data
        this.smokeLaunch = new SmokeEffect(this.scene, 0, 0)
        this.smokeLaunch.emitSmoke(x, y, 0xababab)
        const angle = -this.radian
        if (this.speed > 0) {
            this.isMoving = true
            const curSpeed = Math.min(this.speed, SPEED_LIMIT) * 7.5
            this.enableBody(true, x, y, true, true)
            this.setVelocity(getProjectX(curSpeed, angle), getProjectY(curSpeed, angle))
            this.scene.physics.velocityFromRotation(angle, curSpeed, this.body?.velocity)
        }
    }

    public onFlyUpdate(_delta: number) {
        if (this.isMoving) this.rotation += 0.2
        console.log(this.x, this.y)
    }

    public onSnipeEnter(data: number[]) {
        this.speed = data[0]
        this.radian = data[1]
        this.trajectory = []
        this.points = this.scene.add.graphics()
        this.points.fillStyle(0xffa500, 1)
        for (let i = 0; i < 6; i++) {
            const time = i * 0.2
            let x =
                this.x + getProjectX(Math.min(SPEED_LIMIT, this.speed) * 7.5, this.radian) * time
            const y =
                this.y -
                getProjectY(Math.min(SPEED_LIMIT, this.speed) * 7.5, this.radian) * time +
                0.5 * 980 * time ** 2
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
        return this.powerUp && this.smokeParticle
    }

    public disablePowerUp() {
        this.powerUp = false
    }

    public isFlyingDown() {
        return (this.body?.velocity.y || 0) > 0
    }

    public isOverlap() {
        console.log(this.body?.overlapX, this.body?.overlapY)
        const h = this.body ? getHypot(this.body?.overlapX, this.body?.overlapY) : 0
        return h > 0.1 * this.width
    }

    public isOutOfBounds() {
        return (
            this.x - this.width * this.scale < 0 || this.x > CANVAS_WIDTH - this.width * this.scale
        )
    }

    public onNotify(e: number) {
        const curScore = gameManager.getScoreManager().getCurScore()
        switch (e) {
            case COLLISION_EVENTS['CURRENT_BASKET']:
                this.smokeLaunch = new SmokeEffect(this.scene, 0, 0)
                this.smokeLaunch.emitSmoke(this.x, this.y, 0xababab)
                break
            case COLLISION_EVENTS['NEXT_BASKET']:
                this.smokeLaunch = new SmokeEffect(this.scene, 0, 0)
                this.smokeLaunch.emitSmoke(this.x, this.y, 0x0078d4)
                if (this.isPowerUp()) {
                    this.disableSmoke()
                    this.disablePowerUp()
                }
                if (curScore % 5 == 0 && curScore > 0) this.emitSmokeParticle()
                break
            case COLLISION_EVENTS['WALL']:
                this.flameParticle = this.scene.add.particles(
                    this.x,
                    this.y,
                    'flares',
                    flameParticleConfig
                )
                this.flameParticle.setDepth(1)
                this.flameParticle.once('complete', () => {
                    this.flameParticle.destroy()
                })
        }
    }
}

const flameParticleConfig = {
    frame: 'white',
    color: [0xfacc22, 0xf89800, 0xf83600, 0x9f0404],
    colorEase: 'quad.out',
    lifespan: 100,
    rotate: 90,
    scale: { start: 0.7, end: 0, ease: 'sine.out' },
    speed: 200,
    advance: 500,
    frequency: 60,
    blendMode: 'ADD',
    duration: 200,
}

const smokeParticleConfig = {
    color: [0xe2224c, 0xe25822, 0xe2b822, 0x696969, 0xf5f5f5],
    alpha: { start: 0.9, end: 0.1, ease: 'sine.easeout' },
    angle: { min: 0, max: 360 },
    rotate: { min: 0, max: 360 },
    speed: { min: 40, max: 70 },
    colorEase: 'quad.easeinout',
    lifespan: 1500,
    scale: 0.5,
    frequency: 60,
}
