import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../constants'
import { gameManager } from '../game'
import ClickableImage from '../objects/images/ClickableImage'
import Image from '../objects/images/Image'
import { Text } from '../objects/texts/Text'

type SceneParam = {
    data: number
}

type LeaderboardItem = {
    name: string
    score: number
}

export default class GameOverScene extends Phaser.Scene {
    private boardText: Text
    constructor() {
        super({ key: 'GameOverScene' })
    }

    public updateLeaderboard() {
        let display = ''
        this.firebase.getHighScores().then((data: LeaderboardItem[]) => {
            data.forEach((item: LeaderboardItem, i: number) => {
                display += `\n${i + 1}. ${item.name} ${item.score}`
            })
            this.boardText.setText(display)
        })
    }

    public update(time: number) {
        if (Math.floor(time / 1000) % 10) {
            this.updateLeaderboard() // update after each K secs
        }
    }

    public create(data: SceneParam) {
        this.cameras.main.fadeIn(500, 0, 0, 0)

        this.boardText = new Text({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: 620,
            msg: 'Fetching...',
            style: { fontFamily: 'MilkyHoney', fontSize: '35px', color: 'black' },
        }).setDepth(10)

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
            msg: gameManager.getScoreManager().getStars().toString(),
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
            y: CANVAS_HEIGHT / 2 - 470,
            msg: 'BEST SCORE',
            style: { fontSize: '50px', color: '#ffa500', fontStyle: 'bold' },
        })

        const bestScoreText = new Text({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2 - 380,
            msg: gameManager.getScoreManager().getBestScore().toString(),
            style: { fontSize: '90px', color: '#ffa500', fontStyle: 'bold' },
        })

        const scoreText = new Text({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2 - 220,
            msg: data.data.toString(),
            style: { fontSize: '180px', color: '#ababab', fontStyle: 'bold' },
        })

        /* const adImg = new ClickableImage({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2 + 100,
            key: 'ad',
            callback: () => {
                window.location.href = 'https://www.youtube.com/'
            },
            scale: 0.4,
        }) */

        const igImg = new ClickableImage({
            scene: this,
            x: CANVAS_WIDTH / 2 - 150,
            y: CANVAS_HEIGHT / 2 + 400,
            key: 'ig',
            callback: () => {
                window.location.href = 'https://www.facebook.com/khasang0412/'
            },
            scale: 0.4,
        })

        const retImg = new ClickableImage({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2 + 400,
            key: 'return',
            callback: () => {
                this.scene.start('PlayScene')
            },
            scale: 0.4,
        })

        const settingsImg = new ClickableImage({
            scene: this,
            x: CANVAS_WIDTH / 2 + 150,
            y: CANVAS_HEIGHT / 2 + 400,
            key: 'settings',
            callback: () => {
                gameManager
                    .getSceneManager()
                    .stateMachine.setState('setting', this, { data: 'over' })
            },
            scale: 0.32,
        })
    }
}
