import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../constants'
import Ball from '../objects/game-objects/Ball'
import Basket from '../objects/game-objects/Basket'
import Star from '../objects/game-objects/Star'
import Background from '../objects/images/Background'
import ClickableImage from '../objects/images/ClickableImage'
import Image from '../objects/images/Image'
import FpsText from '../objects/texts/FpsText'
import { Text } from '../objects/texts/Text'
import { Point } from '../types/point'
import { Sound } from '../types/sound'

type SceneParam = {
    skin: string
}

export default class PlayScene extends Phaser.Scene {
    // Background & Assets & Texts
    private background: Background
    private netAudio: Sound
    private gameOverAudio: Sound
    private shootAudio: Sound
    private clickAudio: Sound
    private starImg: Image
    private pauseImg: ClickableImage
    private curScoreText: Text
    private scoreText: Text
    private perfectText: Text
    private fps: FpsText

    // GameObjects
    private curBasket: Basket
    private nextBasket: Basket
    private ball: Ball
    private star: Star

    // Game Controller Variables
    private score: number
    private starCnt: number
    private isGameEnd = false
    private dragStart: Point | null
    private lineGroupBounds: Phaser.Physics.Arcade.Group
    private lineGroupUpperBounds: Phaser.Physics.Arcade.Group
    private trajectory: Point[]
    private points: Phaser.GameObjects.Graphics
    private shootAngle: number

    constructor() {
        super({ key: 'PlayScene' })

        this.score = 0

        // Restart 'star'
        if (!localStorage.getItem('star')) {
            localStorage.setItem('star', '0')
            this.starCnt = 0
        } else {
            this.starCnt = parseInt(<string>localStorage.getItem('star'))
        }
    }

    public create(data: SceneParam) {
        // Reset Vars
        this.score = 0
        this.isGameEnd = false
        this.starCnt = 0
        this.shootAngle = 0
        this.netAudio = this.sound.add('net')
        this.shootAudio = this.sound.add('shoot')
        this.clickAudio = this.sound.add('click')
        this.gameOverAudio = this.sound.add('game-over')

        // Create Objects & Events
        this.createAssets()
        this.createWall()
        this.createObjects(data)
        this.createEventListeners()
    }

    public update() {
        if (this.ball.getIsMoving()) this.ball.rotation += 0.1
        this.fps.update()
        this.background.tilePositionY -= 1
        this.cameras.main.setScroll(this.cameras.main.scrollX, this.ball.y - this.curBasket.y)
        this.emitHitLowerBoundEvent()
        this.emitHitCurrentBasketEvent()
        this.emitHitNextBasketEvent()
    }

    public setTrajectory(power: number, angle: number) {
        if (angle != this.shootAngle) {
            this.shootAngle = angle
            this.trajectory = []
            this.points = this.add.graphics()
            this.points.fillStyle(0xffa500, 1)
            for (let i = 0; i < 6; i++) {
                const timeSlice = i * 1.5
                let x = this.ball.x + power * Math.cos(angle) * timeSlice
                const y =
                    this.ball.y - power * Math.sin(angle) * timeSlice + 0.5 * 20 * timeSlice ** 2
                if (x < 0) x = -x
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

    private onPointerDown(pointer: Phaser.Input.Pointer) {
        this.dragStart = { x: pointer.x, y: pointer.y }
    }

    private onPointerUp(pointer: Phaser.Input.Pointer) {
        if (this.dragStart) {
            // calculate the angle between the bird and the pointer
            const angle = Phaser.Math.Angle.Between(
                this.dragStart.x,
                this.dragStart.y,
                pointer.x,
                pointer.y
            )

            // apply velocity to the this based on the angle and distance
            const distance = Phaser.Math.Distance.Between(
                this.dragStart.x,
                this.dragStart.y,
                pointer.x,
                pointer.y
            )
            const velocity = distance

            // set the this to not be dragged anymore
            this.curBasket.setScale(this.curBasket.scaleX, this.curBasket.scaleX)
            this.ball.fly(this.curBasket.x, this.curBasket.y, Math.PI - angle, velocity)
            this.dragStart = null
            this.shootAudio.play()
            if (this.points) this.points.destroy()
        }
    }

    private onPointerMove(pointer: Phaser.Input.Pointer) {
        if (pointer.isDown && this.dragStart) {
            if (this.points) this.points.destroy()
            // calculate the angle between the bird and the pointer
            const angle = Phaser.Math.Angle.Between(
                this.dragStart.x,
                this.dragStart.y,
                pointer.x,
                pointer.y
            )

            // Set the object's rotation to the calculated angle
            this.curBasket.rotation = angle - Math.PI / 2

            // Calculate the distance and angle between the starting position of the drag and the current pointer position
            const distance = Phaser.Math.Distance.Between(
                this.dragStart.x,
                this.dragStart.y,
                pointer.x,
                pointer.y
            )
            this.setTrajectory(distance, Math.PI / 2 - this.curBasket.rotation)

            this.curBasket.setScale(
                this.curBasket.scaleX,
                Math.min(this.curBasket.scaleY * 1.2, 0.9)
            )
        }
    }

    private createAssets() {
        const [W, H] = [CANVAS_WIDTH, CANVAS_HEIGHT]
        this.background = new Background({
            scene: this,
            x: W / 2,
            y: H / 2,
            w: 4096,
            h: 4096,
            key: 'wall_0',
            scale: 0.45,
        })

        this.fps = new FpsText(this)

        const wallUp = new Image({
            scene: this,
            x: W / 2,
            y: -H + 25,
            key: 'bg_1',
        }).setAlpha(0.6)

        const wallImg = new Image({
            scene: this,
            x: W / 2,
            y: H / 2,
            key: 'bg_0',
        })
            .setAlpha(0.6)
            .setScale(0.55)

        this.pauseImg = new ClickableImage({
            scene: this,
            x: 80,
            y: 50,
            key: 'pause',
            callback: () => {
                this.scene.switch('PauseScene')
            },
            scale: 0.12,
        })
        this.starImg = new Image({
            scene: this,
            x: W - 90,
            y: 50,
            key: 'star',
            scale: 0.32,
        })
        this.scoreText = new Text({
            scene: this,
            x: W - 40,
            y: 50,
            msg: this.starCnt.toString(),
            style: {
                fontFamily: 'MilkyHoney',
                fontSize: '45px',
                color: 'black',
                strokeThickness: 3,
            },
        })
        this.curScoreText = new Text({
            scene: this,
            x: W / 2,
            y: H / 2 - 120,
            msg: this.score.toString(),
            style: { fontSize: '150px', color: '#ababab', fontStyle: 'bold' },
        })

        this.perfectText = new Text({
            scene: this,
            x: -100,
            y: -100,
            msg: 'PERFECT!!',
            style: { fontSize: '18px', color: '#ffa500', fontStyle: 'bold' },
        })
    }

    private createWall() {
        const [W, H] = [CANVAS_WIDTH, CANVAS_HEIGHT]
        const line1 = this.add.line(0, -5 * H, 0, -5 * H, 0, 5 * H)
        const line2 = this.add.line(W, -5 * H, W, -5 * H, W, 5 * H)
        const line3 = this.add.line(0, 0, 0, 0, 0, H * 2)
        const line4 = this.add.line(W, 0, W, 0, W, H * 2)

        this.lineGroupUpperBounds = this.physics.add.group({
            allowGravity: false,
            immovable: true,
            visible: true,
            bounceX: 1,
            bounceY: 1,
        })
        this.lineGroupUpperBounds.add(line1)
        this.lineGroupUpperBounds.add(line2)

        this.lineGroupBounds = this.physics.add.group({
            allowGravity: false,
            immovable: true,
            visible: true,
            collideWorldBounds: true,
            bounceX: 1,
            bounceY: 1,
        })
        this.lineGroupBounds.add(line3)
        this.lineGroupBounds.add(line4)
    }

    private createObjects(data: SceneParam) {
        this.star = new Star({
            scene: this,
            x: CANVAS_WIDTH - 90,
            y: 50,
            key: 'star',
            scale: 0.32,
        })

        this.curBasket = new Basket({
            scene: this,
            x: 130,
            y: CANVAS_HEIGHT / 2 + 200,
            key: 'basket',
            callback: (x: number, y: number, angle: number, speed: number) => {
                this.ball.fly(x, y, angle, speed)
            },
            scale: 0.65,
        })
            .setDepth(2)
            .setMaxVelocity(0, 0)

        this.nextBasket = new Basket({
            scene: this,
            x: CANVAS_WIDTH - 140,
            y: CANVAS_HEIGHT / 2 - 200,
            key: 'basket',
            callback: (x: number, y: number, angle: number, speed: number) => {
                this.ball.fly(x, y, angle, speed)
            },
            scale: 0.65,
        })
            .setDepth(2)
            .setMaxVelocity(0, 0)

        this.ball = new Ball({
            scene: this,
            x: 125,
            y: CANVAS_HEIGHT / 2 + 200,
            key: 'ball',
            scale: 0.12,
        }).setDepth(1)
        if (data) this.ball.changeSkin(data.skin)
    }

    private createEventListeners() {
        this.input.on('pointerdown', this.onPointerDown, this)
        this.input.on('pointermove', this.onPointerMove, this)
        this.input.on('pointerup', this.onPointerUp, this)

        this.physics.add.collider(this.ball, [
            this.lineGroupUpperBounds,
            this.lineGroupBounds,
            this.nextBasket.edgeGroup,
        ])
    }

    private emitHitLowerBoundEvent() {
        if (this.ball.y > CANVAS_HEIGHT) {
            this.gameOverAudio.play()
            this.scene.start('GameOverScene', { data: this.score })
            const curHighScore = localStorage.getItem('high-score')
            if (curHighScore == null) {
                localStorage.setItem('high-score', this.score.toString())
            } else {
                localStorage.setItem(
                    'high-score',
                    Math.max(parseInt(curHighScore), this.score).toString()
                )
            }
            localStorage.setItem(
                'star',
                (
                    (localStorage.getItem('star')
                        ? parseInt(<string>localStorage.getItem('star'))
                        : 0) + this.starCnt
                ).toString()
            )
            this.isGameEnd = true
        }
    }

    private emitHitCurrentBasketEvent() {
        if (
            (this.ball.body?.velocity.y || 0) > 0 &&
            this.physics.collide(this.ball, this.curBasket.bodyGroup) &&
            this.ball.body?.touching.down
        ) {
            this.curBasket.reset()
            this.ball.resetPosition(this.curBasket.x, this.curBasket.y)
            this.netAudio.play()
        }
    }

    private emitHitNextBasketEvent() {
        if (this.ball.body) {
            const veloAngle = Math.atan2(this.ball.body?.velocity.y, this.ball.body?.velocity.x)
            if (
                this.ball.body?.velocity.y > 0 &&
                this.physics.collide(this.ball, this.nextBasket.bodyGroup) &&
                Math.abs(this.nextBasket.rotation - veloAngle) <= Math.PI / 2.2 // ensure direct collision
            ) {
                {
                    if (this.nextBasket.rotation - -veloAngle <= 0.15) {
                        this.perfectText.setX(this.nextBasket.x)
                        this.perfectText.setY(this.nextBasket.y - 50)
                        this.perfectText.setAlpha(1)
                        this.tweens.add({
                            targets: this.perfectText,
                            alpha: 0,
                            duration: 500,
                            ease: 'ease.sineInOut',
                            onComplete: () => {
                                this.perfectText.setAlpha(0)
                            },
                        })
                    }
                }
                this.netAudio.play()
                this.score += 1
                this.curScoreText.text = this.score.toString()
                this.ball.resetPosition(this.nextBasket.x, this.nextBasket.y)

                this.curBasket.resetPosition(this.star)
                this.nextBasket.resetPosition(this.ball)

                if (Math.abs(this.ball.getBounds().centerX - this.star.getBounds().centerX) < 50) {
                    this.starCnt++

                    this.clickAudio.play()
                    this.scoreText.text = this.starCnt.toString()
                }

                const temp = this.curBasket
                this.curBasket = this.nextBasket
                this.nextBasket = temp
            }
        }
    }
}
