import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../constants'
import { gameManager } from '../game'
import ClickableImage from '../objects/images/ClickableImage'
import Image from '../objects/images/Image'
import { Text } from '../objects/texts/Text'

export default class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseScene' })
    }

    public create() {
        const settingsImg = new ClickableImage({
            scene: this,
            x: 80,
            y: 50,
            key: 'settings',
            callback: () => {
                gameManager
                    .getSceneManager()
                    .stateMachine.setState('setting', this, { data: 'pause' })
            },
            scale: 0.32,
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
            style: {
                fontFamily: 'MilkyHoney',
                fontSize: '45px',
                color: 'black',
                strokeThickness: 3,
            },
        })
        const pauseText = new Text({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2 - 280,
            msg: 'PAUSED',
            style: { fontSize: '100px', color: '#ababab', fontStyle: 'bold' },
        })
        const mainmenuImg = new ClickableImage({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2 - 150,
            key: 'main-menu',
            callback: () => {
                gameManager.getSceneManager().stateMachine.setState('start', this)
            },
            scale: 0.32,
        })
        const leaderboardImg = new ClickableImage({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2,
            key: 'leader-board',
            callback: () => {
                console.log('Leaderboard')
            },
            scale: 0.32,
        })
        const resumeImg = new ClickableImage({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2 + 200,
            key: 'resume',
            callback: () => {
                gameManager.getSceneManager().stateMachine.setState('resume', this)
            },
            scale: 0.36,
        })
    }
}
