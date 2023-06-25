import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../constants'
import ClickableImage from '../objects/images/ClickableImage'
import Image from '../objects/images/Image'
import { Text } from '../objects/texts/Text'

type SceneParam = {
    data: number
}

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' })
    }

    public create(data: SceneParam) {
        this.cameras.main.fadeIn(500, 0, 0, 0)

        const star = new Image({
            scene: this,
            x: CANVAS_WIDTH - 90,
            y: 50,
            key: 'star',
            scale: 0.32 * 1.5,
        })
        const starsCnt = new Text({
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

        const bestScoreMsgText = new Text({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2 - 370,
            msg: 'BEST SCORE',
            style: { fontSize: '50px', color: '#ffa500', fontStyle: 'bold' },
        })

        const bestScoreText = new Text({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2 - 280,
            msg: <string>localStorage.getItem('high-score'),
            style: { fontSize: '90px', color: '#ffa500', fontStyle: 'bold' },
        })

        const scoreText = new Text({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2 - 120,
            msg: data.data.toString(),
            style: { fontSize: '180px', color: '#ababab', fontStyle: 'bold' },
        })

        const adImg = new ClickableImage({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2 + 100,
            key: 'ad',
            callback: () => {
                window.location.href = 'https://www.youtube.com/'
            },
            scale: 0.4,
        })

        const igImg = new ClickableImage({
            scene: this,
            x: CANVAS_WIDTH / 2 - 150,
            y: CANVAS_HEIGHT / 2 + 300,
            key: 'ig',
            callback: () => {
                window.location.href = 'https://www.facebook.com/khasang0412/'
            },
            scale: 0.4,
        })

        const retImg = new ClickableImage({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2 + 300,
            key: 'return',
            callback: () => {
                this.scene.start('PlayScene')
            },
            scale: 0.4,
        })

        const settingsImg = new ClickableImage({
            scene: this,
            x: CANVAS_WIDTH / 2 + 150,
            y: CANVAS_HEIGHT / 2 + 300,
            key: 'settings',
            callback: () => {
                this.scene.start('SettingScene', { data: 'GameOverScene' })
            },
            scale: 0.32,
        })
    }
}
