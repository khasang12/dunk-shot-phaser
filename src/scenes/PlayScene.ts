import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../constants'
import Ball from '../objects/game-objects/Ball'
import Basket from '../objects/game-objects/Basket'
import Star from '../objects/game-objects/Star'
import Background from '../objects/images/Background'
import ClickableImage from '../objects/images/ClickableImage'
import Image from '../objects/images/Image'
import { Text } from '../objects/texts/Text'
import { Point } from '../types/point'
import { Sound } from '../types/sound'

let lock = true

export default class PlayScene extends Phaser.Scene {
    private background: Background
    private ball: Ball
    private curBasket: Basket
    private nextBasket: Basket
    private score: number
    private curScoreText: Text
    private netAudio: Sound
    private bounceAudio: Sound
    private gameOverAudio: Sound
    private shootAudio: Sound
    private clickAudio: Sound
    private starImg: Image
    private pauseImg: ClickableImage
    private scoreText: Text
    private star: Star
    private starCnt: number
    private isGameEnd = false
    private dragStart: Point | null

    constructor() {
        super({ key: 'PlayScene' })
        this.score = 0
        if (!localStorage.getItem('star')) {
            localStorage.setItem('star', '0')
            this.starCnt = 0
        } else {
            this.starCnt = parseInt(<string>localStorage.getItem('star'))
        }
    }

    preload() {
        return
    }

    create() {
        this.score = 0
        this.isGameEnd = false
        this.starCnt = 0
        this.netAudio = this.sound.add('net')
        this.shootAudio = this.sound.add('shoot')
        this.clickAudio = this.sound.add('click')
        this.bounceAudio = this.sound.add('bounce')
        this.gameOverAudio = this.sound.add('game-over')

        this.background = new Background({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2,
            w: 2048,
            h: 2048,
            key: 'wall_0',
            scale: 0.5,
        })

        const wallImg = new Image({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2,
            key: 'bg_0',
        })
            .setAlpha(0.6)
            .setScale(1)

        this.pauseImg = new ClickableImage({
            scene: this,
            x: 80,
            y: 50,
            key: 'pause',
            callback: () => {
                //this.scene.pause('PlayScene')
                this.scene.switch('PauseScene')
            },
            scale: 0.12,
        })
        this.starImg = new Image({
            scene: this,
            x: CANVAS_WIDTH - 90,
            y: 50,
            key: 'star',
            scale: 0.32,
        })
        this.scoreText = new Text({
            scene: this,
            x: CANVAS_WIDTH - 40,
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
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2 - 120,
            msg: this.score.toString(),
            style: { fontSize: '150px', color: '#ababab', fontStyle: 'bold' },
        })

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

        // Add event listeners for the image click/touch events

        this.input.on('pointerdown', this.onPointerDown, this)
        this.input.on('pointermove', this.onPointerMove, this)
        this.input.on('pointerup', this.onPointerUp, this)
    }

    public onPointerDown(pointer: Phaser.Input.Pointer) {
        this.dragStart = { x: pointer.x, y: pointer.y }
    }

    public onPointerUp(pointer: Phaser.Input.Pointer) {
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
        }
    }

    public onPointerMove(pointer: Phaser.Input.Pointer) {
        // Mutex Lock
        if (lock && this.dragStart) {
            lock = false

            if (pointer.isDown) {
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
                this.curBasket.setTrajectory(
                    Math.max(50, distance * 50),
                    Math.PI / 2 - this.curBasket.rotation
                )

                this.curBasket.setScale(
                    this.curBasket.scaleX,
                    Math.min(this.curBasket.scaleY * 1.2, 0.9)
                )
            }

            setTimeout(function () {
                lock = true
            }, 300) // wait for 300ms before allowing another request
        }
    }

    public update() {
        this.background.tilePositionY -= 1
        this.hitLowerBoundCameraHandler()
        this.hitUpperBoundCameraHandler()
        this.hitCurrentBasketHandler()
        this.hitNextBasketHandler()
    }

    private hitUpperBoundCameraHandler() {
        if (this.ball.y < 50) {
            this.scoreText.setAlpha(0)
            this.pauseImg.setAlpha(0)
            this.starImg.setAlpha(0)
            this.cameras.main.setScroll(this.cameras.main.scrollX, this.ball.y - 150)
        } else {
            this.scoreText.setAlpha(1)
            this.pauseImg.setAlpha(1)
            this.starImg.setAlpha(1)
            this.cameras.main.stopFollow()
            this.cameras.main.setScroll(0, 0)
        }
    }

    private hitLowerBoundCameraHandler() {
        this.physics.world.on(
            'worldbounds',
            (
                _body: Phaser.Physics.Arcade.Body,
                _up: boolean,
                down: boolean,
                left: boolean,
                right: boolean
            ) => {
                if (left || right) {
                    this.bounceAudio.play()
                }
                if (down && !this.isGameEnd) {
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
        )
    }

    private hitCurrentBasketHandler() {
        if (
            this.physics.overlap(this.ball, this.curBasket) &&
            Math.abs(this.ball.getBounds().bottom - this.curBasket.getBounds().top) < 25
        ) {
            this.curBasket.reset()
            this.ball.resetPosition(this.curBasket.x, this.curBasket.y)
            this.netAudio.play()
        }
    }

    private hitNextBasketHandler() {
        if (this.physics.overlap(this.ball, this.nextBasket)) {
            if (Math.abs(this.ball.getBounds().bottom - this.nextBasket.getBounds().top) < 25) {
                this.netAudio.play()
                this.score += 1
                this.curScoreText.text = this.score.toString()
                this.ball.resetPosition(this.nextBasket.x, this.nextBasket.y)

                this.curBasket.resetPosition(this.star)
                this.nextBasket.resetPosition(this.ball)

                if (Math.abs(this.ball.getBounds().centerX - this.star.getBounds().centerX) < 25) {
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
