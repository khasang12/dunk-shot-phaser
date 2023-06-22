import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../constants'
import ClickableImage from '../objects/images/ClickableImage'
import Image from '../objects/images/Image'
import { Text } from '../objects/texts/Text'

export default class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseScene' })
    }

    preload() {
        return
    }

    create() {
        const settingsImg = new ClickableImage({
            scene: this,
            x: 80,
            y: 50,
            key: 'settings',
            callback: () => {
                this.scene.start('SettingScene', { data: 'PauseScene' })
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
                this.scene.start('StartScene')
            },
            scale: 0.32,
        })
        const customizeImg = new ClickableImage({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2 - 50,
            key: 'customize',
            callback: () => {},
            scale: 0.32,
        })
        const leaderboardImg = new ClickableImage({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2 + 50,
            key: 'leader-board',
            callback: () => {},
            scale: 0.32,
        })
        const resumeImg = new ClickableImage({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2 + 250,
            key: 'resume',
            callback: () => {
                this.scene.switch('PlayScene')
                //this.scene.bringToTop('PlayScene')
            },
            scale: 0.36,
        })
    }
}
