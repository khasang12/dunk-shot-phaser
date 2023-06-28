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

            if (this.boardText && display) this.boardText.setText(display)
        })
    }

    public create(data: SceneParam) {
        //this.cameras.main.fadeIn(500, 0, 0, 0)

        this.boardText = new Text({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: 620,
            msg: 'Fetching...',
            style: { fontFamily: 'MilkyHoney', fontSize: '35px', color: '#e2224c' },
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
        }).setAlpha(0)

        const scoreText = new Text({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2 - 220,
            msg: '0',
            style: { fontSize: '180px', color: '#ababab', fontStyle: 'bold' },
        })
        // Create a new tween object to animate the score
        this.tweens.add({
            targets: { score: '0' },
            score: data.data.toString(),
            duration: 1000,
            ease: 'Power1',
            onUpdate: function (tween: any) {
                // Update the score text with the rounded score value
                scoreText.text = Math.round(tween.targets[0].score).toString()
            },
            onComplete: function () {
                // Animation complete callback
                bestScoreText.setAlpha(1)
            },
        })

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

    public update(time: number) {
        try {
            if (Math.floor(time / 1000) % 3 == 0) {
                this.updateLeaderboard() // update after each 3 secs
            }
        } catch (err) {
            console.log(err)
        }
    }
}
