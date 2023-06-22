import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../constants'
import Ball from '../objects/game-objects/Ball'
import Basket from '../objects/game-objects/Basket'
import Star from '../objects/game-objects/Star'
import Background from '../objects/images/Background'
import ClickableImage from '../objects/images/ClickableImage'
import Image from '../objects/images/Image'
import { Text } from '../objects/texts/Text'
import { Sound } from '../types/sound'

export default class PlayScene extends Phaser.Scene {
    private background: Background
    private ball: Ball
    private curBasket: Basket
    private nextBasket: Basket
    private score: number
    private curScoreText: Text
    private scrollSpeed: number
    private netAudio: Sound
    private controls: Phaser.Cameras.Controls.SmoothedKeyControl
    private bounceAudio: Sound
    private gameOverAudio: Sound
    private starImg: Image
    private pauseImg: ClickableImage
    private scoreText: Text
    private star: Star
    private starCnt: number
    private isGameEnd = false

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
            this.cameras.main.setScroll(this.cameras.main.scrollX, this.ball.y - 250)
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
            (_body: Phaser.Physics.Arcade.Body, _up: boolean, down: boolean) => {
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
                    console.log(this.starCnt)
                    this.isGameEnd = true
                }
            }
        )
    }

    private hitCurrentBasketHandler() {
        if (this.physics.overlap(this.ball, this.curBasket) && this.curBasket.body?.touching.up) {
            this.curBasket.reset()
            this.ball.resetPosition(this.curBasket.x, this.curBasket.y)
            this.netAudio.play()
        }
    }

    private hitNextBasketHandler() {
        if (this.physics.overlap(this.ball, this.nextBasket)) {
            if (Math.abs(this.ball.getBounds().bottom - this.nextBasket.getBounds().top) < 25) {
                this.score += 1
                this.curScoreText.text = this.score.toString()
                this.ball.resetPosition(this.nextBasket.x, this.nextBasket.y)

                this.curBasket.resetPosition(this.star)
                this.nextBasket.resetPosition(this.ball)

                if (Math.abs(this.ball.getBounds().centerX - this.star.getBounds().centerX) < 25) {
                    this.starCnt++

                    this.scoreText.text = this.starCnt.toString()
                }

                //swap
                const temp = this.curBasket
                this.curBasket = this.nextBasket
                this.nextBasket = temp
            }
        }
    }
}
