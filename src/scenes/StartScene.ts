import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../constants'
import Ball from '../objects/game-objects/Ball'
import Button from '../objects/buttons/Button'
import ClickableImage from '../objects/images/ClickableImage'
import Image from '../objects/images/Image'
import { Text } from '../objects/texts/Text'

export default class StartScene extends Phaser.Scene {
    private ball: Ball

    constructor() {
        super({ key: 'StartScene' })
    }

    public create() {
        this.cameras.main.fadeIn(500, 0, 0, 0)

        const settingsImg = new ClickableImage({
            scene: this,
            x: 50,
            y: 50,
            key: 'settings',
            callback: () => {
                this.scene.start('SettingScene', { data: 'StartScene' })
            },
            scale: 0.2 * 1.5,
        })
        const trophyImg = new ClickableImage({
            scene: this,
            x: 160,
            y: 50,
            key: 'leaderboard',
            callback: this.getFreeGift,
            scale: 0.24 * 1.5,
        })
        const starImg = new Image({
            scene: this,
            x: CANVAS_WIDTH - 90,
            y: 50,
            key: 'star',
            scale: 0.32 * 1.5,
        })
        const scoreText = new Text({
            scene: this,
            x: CANVAS_WIDTH - 40,
            y: 50,
            msg: localStorage.getItem('star') || '0',
            style: {
                fontFamily: 'MilkyHoney',
                fontSize: '45px',
                color: 'black',
                strokeThickness: 3,
            },
        })
        const logoImg = new Image({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2 - 170,
            key: 'logo',
            scale: 0.32 * 1.5,
        })
        const basket1Img = new Image({
            scene: this,
            x: 110,
            y: CANVAS_HEIGHT - 200,
            key: 'basket',
            scale: 0.5 * 1.5,
        }).setDepth(2)
        const basket2Img = new Image({
            scene: this,
            x: CANVAS_WIDTH - 140,
            y: CANVAS_HEIGHT / 2 + 30,
            key: 'basket',
            scale: 0.5 * 1.5,
        }).setDepth(2)

        this.ball = new Ball({
            scene: this,
            x: 110,
            y: CANVAS_HEIGHT - 180,
            key: 'ball',
            scale: 0.2,
        }).setDepth(1)

        const dragBtn = new ClickableImage({
            scene: this,
            x: 100,
            y: CANVAS_HEIGHT - 90,
            key: 'drag-it',
            callback: () => {
                // Switch to the game scene
                this.scene.start('PlayScene')
            },
            scale: 0.3 * 1.5,
        })
        dragBtn.enableOscillator()

        const freeGiftBtn = new Button({
            scene: this,
            x: CANVAS_WIDTH - 190,
            y: CANVAS_HEIGHT - 260,
            key: 'free-gift',
            text: 'FREE GIFT!',
            scale: 0.3 * 1.5,
            callback: this.getFreeGift,
        })

        const customizeBtn = new Button({
            scene: this,
            x: CANVAS_WIDTH - 190,
            y: CANVAS_HEIGHT - 160,
            key: 'customize',
            text: '',
            scale: 0.2 * 1.5,
            callback: this.getFreeGift,
        })

        const challengeBtn = new Button({
            scene: this,
            x: CANVAS_WIDTH - 190,
            y: CANVAS_HEIGHT - 60,
            key: 'challenge',
            text: '',
            scale: 0.3 * 1.5,
            callback: this.getFreeGift,
        })
    }

    public update() {
        this.ball.flyDemo()
    }

    public getFreeGift() {
        console.log('free gift!!')
    }
}
