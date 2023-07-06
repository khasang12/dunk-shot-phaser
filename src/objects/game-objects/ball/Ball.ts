import { CANVAS_HEIGHT, CANVAS_WIDTH, COLLISION_EVENTS, SPEED_LIMIT } from '../../../constants'
import SmokeEffect from '../../../effects/SmokeEffect'
import { gameManager } from '../../../game'
import StateMachine from '../../../states/StateMachine'
import { IGameObject } from '../../../types/object'
import IObserver from '../../../types/observer'
import { getHypot, drawParabolaTrajectory, getProjectX, getProjectY } from '../../../utils/math'
import BodyObject from '../BodyObject'
import { flameParticleConfig, smokeParticleConfig } from './config'

export default class Ball extends BodyObject implements IObserver {
    private speed: number
    private radian: number
    private elapsed: number
    private isMoving: boolean
    private powerUp: boolean
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

        this.scene.physics.add.existing(this)

        this.disableBody(true, true)
        this.body?.setCircle(this.width / 2)
        this.setBounce(0.75, 0.75)
        this.setVisible(true)
        this.setGravityY(980)
        this.setOrigin(0.5, 0.5)
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
            this.scene.tweens.add({
                targets: this,
                x: x,
                y: y,
                duration: 100,
                ease: 'Sine.easeInOut',
            })
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
    }

    public onSnipeEnter(data: number[]) {
        this.speed = data[0]
        this.radian = data[1]
        this.points = this.scene.add.graphics()
        this.points.fillStyle(0xffa500, 1)
        drawParabolaTrajectory(
            this.points,
            this.x,
            this.y,
            this.speed,
            this.radian,
            0,
            CANVAS_WIDTH
        )
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

    public isFlying() {
        return this.isMoving
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
