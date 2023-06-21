import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../constants'
import Ball from '../objects/game-objects/Ball'
import Basket from '../objects/game-objects/Basket'
import ClickableImage from '../objects/images/ClickableImage'
import Image from '../objects/images/Image'
import { Text } from '../objects/texts/Text'
import { Sound } from '../types/sound'

export default class PlayScene extends Phaser.Scene {
    private background: Phaser.GameObjects.TileSprite
    private ball: Ball
    private curBasket: Basket
    private nextBasket: Basket
    private score: number
    private curScoreText: Text
    private scrollSpeed: number
    private netAudio: Sound
    private bounceAudio: Sound

    constructor() {
        super({ key: 'PlayScene' })
        this.score = 0
    }

    preload() {
        return
    }

    create() {
        this.netAudio = this.sound.add('net')
        this.bounceAudio = this.sound.add('bounce')

        const pauseImg = new ClickableImage({
            scene: this,
            x: 80,
            y: 50,
            key: 'pause',
            callback: () => console.log('Switch to PauseScene'),
            scale: 0.12,
        })
        const star = new Image({
            scene: this,
            x: CANVAS_WIDTH - 90,
            y: 50,
            key: 'star',
            scale: 0.32 * 1.5,
        })
        const score = new Text({
            scene: this,
            x: CANVAS_WIDTH - 40,
            y: 50,
            msg: '0',
            style: { fontSize: '45px', color: 'black', strokeThickness: 3 },
        })
        this.curScoreText = new Text({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2 - 120,
            msg: this.score.toString(),
            style: { fontSize: '150px', color: '#ababab', fontStyle: 'bold' },
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
        this.physics.world.on('worldbounds', () => {
            if (this.ball.body?.touching.up) console.log('You lose !!!')
        })
        // Ball goes back to current basket
        if (
            this.physics.overlap(this.ball, this.curBasket) &&
            this.ball.body?.touching.down &&
            this.curBasket.body?.touching.up
        ) {
            this.curBasket.reset()
            this.ball.resetPosition(this.curBasket.x, this.curBasket.y)
            this.netAudio.play()
        }
        // Ball hits the next basket
        if (
            this.physics.overlap(this.ball, this.nextBasket) &&
            this.ball.getIsMoving() &&
            this.ball.body?.touching.down &&
            this.nextBasket.body?.touching.up
        ) {
            this.score += 1
            this.curScoreText.text = this.score.toString()
            this.curBasket.resetPosition(null)
            this.nextBasket.resetPosition(this.ball)

            //swap
            const temp = this.curBasket
            this.curBasket = this.nextBasket
            this.nextBasket = temp
        }
    }
}
