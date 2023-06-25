import { CANVAS_HEIGHT, CANVAS_WIDTH, DARK_BG, LIGHT_BG } from '../constants'
import ClickableImage from '../objects/images/ClickableImage'
import Image from '../objects/images/Image'
import { Text } from '../objects/texts/Text'

type SceneParam = {
    data: string
}

const div = <HTMLElement>document.getElementById('game')

export default class SettingScene extends Phaser.Scene {
    private soundImgOn: ClickableImage
    private soundImgOff: ClickableImage
    private lightImgOn: ClickableImage
    private lightImgOff: ClickableImage

    constructor() {
        super({ key: 'SettingScene' })
    }

    public create(data: SceneParam) {
        const closeImg = new ClickableImage({
            scene: this,
            x: 50,
            y: 45,
            key: 'close',
            callback: () => {
                this.scene.start(data.data)
            },
            scale: 0.2 * 1.5,
        })

        const settingsText = new Text({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: 50,
            msg: 'SETTINGS',
            style: { fontFamily: 'MilkyHoney', fontSize: '45px', color: '#ababab' },
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
            msg: localStorage.getItem('star') || '0',
            style: { fontFamily: 'MilkyHoney', fontSize: '45px', color: 'black', strokeThickness: 3 },
        })

        this.soundImgOn = new ClickableImage({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2,
            key: 'sound-on',
            callback: () => {
                this.handleMuteSound()
            },
            scale: 0.2 * 1.5,
        }).setAlpha(this.sound.mute ? 0 : 1)

        this.soundImgOff = new ClickableImage({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2,
            key: 'sound-off',
            callback: () => {
                this.handleMuteSound()
            },
            scale: 0.2 * 1.5,
        }).setAlpha(this.sound.mute ? 1 : 0)

        this.lightImgOn = new ClickableImage({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2 - 120,
            key: 'light-on',
            callback: () => {
                this.handleToggleLight()
            },
            scale: 0.8,
        }).setAlpha(div.style.backgroundColor == LIGHT_BG ? 1 : 0)
        this.lightImgOff = new ClickableImage({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2 - 120,
            key: 'light-off',
            callback: () => {
                this.handleToggleLight()
            },
            scale: 0.8,
        }).setAlpha(div.style.backgroundColor == LIGHT_BG ? 0 : 1)
    }

    private handleMuteSound() {
        if (this.sound.mute) {
            this.sound.setMute(false)
            this.soundImgOn.setAlpha(1)
            this.soundImgOff.setAlpha(0)
        } else {
            this.sound.setMute(true)
            this.soundImgOn.setAlpha(0)
            this.soundImgOff.setAlpha(1)
        }
    }

    private handleToggleLight() {
        if (div.style.backgroundColor === LIGHT_BG) {
            div.style.backgroundColor = DARK_BG
            this.lightImgOn.setAlpha(0)
            this.lightImgOff.setAlpha(1)
        } else {
            div.style.backgroundColor = LIGHT_BG
            this.lightImgOn.setAlpha(1)
            this.lightImgOff.setAlpha(0)
        }
    }
}
