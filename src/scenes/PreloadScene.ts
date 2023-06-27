import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../constants'
import { sceneManager } from '../game'

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' })
    }

    public preload() {
        sceneManager.stateMachine.setState('preload', this)

        // Loading Indicator
        this.showProgress()

        // Images
        this.preloadButtons()
        this.preloadBalls()
        this.preloadThemes()
        this.preloadSprites()

        // Audio
        this.preloadAudio()
    }

    public create() {
        sceneManager.stateMachine.setState('start', this)
    }

    private showProgress(): void {
        const progressBar = this.add.graphics()
        progressBar.fillStyle(0xffffff, 1)

        const progressBox = progressBar.fillRect(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 0, 30)

        const progressText = this.add.text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 15, '0%', {
            fontFamily: 'MilkyHoney',
            fontSize: '40px',
            color: '#ababab',
        })
        progressText.setOrigin()

        const progressFileText = this.add.text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20, '0%', {
            fontFamily: 'MilkyHoney',
            fontSize: '25px',
            color: '#ababab',
        })
        progressFileText.setOrigin()

        this.load.on('progress', function (value: number) {
            progressBox.fillRect(CANVAS_WIDTH / 2 - 125, CANVAS_HEIGHT / 2 + 50, 250 * value, 30)
            progressText.setText(Math.floor(value * 100) + '%')
        })

        this.load.on('fileprogress', function (file: Phaser.Loader.File) {
            progressFileText.setText(
                'Loading ' +
                    file.type +
                    ': ' +
                    file.key +
                    ' ' +
                    (file.bytesTotal / 1024).toFixed(2) +
                    'KB'
            )
        })

        this.load.on('complete', () => {
            progressBar.destroy()
            progressText.destroy()
            progressFileText.destroy()
            progressBox.destroy()
        })
    }

    private preloadButtons(): void {
        this.load.setPath('assets/images/buttons/')
        this.load.image('close', 'Close.png')
        this.load.image('close', 'Divide.png')
        this.load.image('close', 'Facebook.png')
        this.load.image('f-left', 'ForwardLeft.png')
        this.load.image('f-right', 'ForwardRight.png')
        this.load.image('game-pad', 'GamePad.png')
        this.load.image('google', 'Google.png')
        this.load.image('heart', 'Heart.png')
        this.load.image('home', 'Home.png')
        this.load.image('ig', 'Instagram.png')
        this.load.image('ad', 'ad.png')
        this.load.image('return', 'return.png')
        this.load.image('trophy', 'Trophy.png')
        this.load.image('trash', 'Trash.png')
        this.load.image('sound-on', 'sound-on.png')
        this.load.image('sound-off', 'sound-off.png')
        this.load.image('light-on', 'light-on.png')
        this.load.image('light-off', 'light-off.png')
        this.load.image('shop', 'Shop.png')
        this.load.image('share', 'Share.png')
        this.load.image('settings', 'Settings.png')
        this.load.image('right', 'Right.png')
        this.load.image('retry', 'Retry.png')
        this.load.image('question', 'Question.png')
        this.load.image('pow-up', 'PowerUp.png')
        this.load.image('left', 'Left.png')
        this.load.image('menu', 'Menu.png')
        this.load.image('msg', 'Message.png')
        this.load.image('music', 'Music.png')
        this.load.image('minus', 'Minus.png')
        this.load.image('pause', 'Pause.png')
        this.load.image('play', 'Play.png')
        this.load.image('plus', 'Plus.png')
        this.load.image('free-gift', 'FreeGift.png')
        this.load.image('drag-it', 'DragIt.png')
        this.load.image('customize', 'customize.png')
        this.load.image('challenge', 'challenge.png')
        this.load.image('leaderboard', 'Leaderboard.png')
        this.load.image('leader-board', 'leader-board.png')
        this.load.image('main-menu', 'mainmenu.png')
        this.load.image('resume', 'resume.png')
        this.load.image('lock', 'lock.png')
    }

    private preloadBalls(): void {
        this.load.setPath('assets/images/colorful-balls/')
        this.load.image('ball_1', '1.png')
        this.load.image('ball_2', '2.png')
        this.load.image('ball_3', '3.png')
        this.load.image('ball_4', '4.png')
        this.load.image('ball_5', '5.png')
        this.load.image('ball_6', '6.png')
        this.load.image('ball_7', '7.png')
        this.load.image('ball_8', '8.png')
        this.load.image('ball_9', '9.png')
        this.load.image('ball_10', '10.png')
        this.load.image('ball_11', '11.png')
        this.load.image('ball_12', '12.png')
        this.load.image('ball_locked', 'Locked.png')
    }

    private preloadSprites(): void {
        this.load.setPath('assets/images/sprites/')
        this.load.image('dot', 'Dot_0.png')
        this.load.image('ball', 'ball.png')
        this.load.image('hoop-down', 'hoop_1.png')
        this.load.image('hoop-up', 'hoop_2.png')
        this.load.image('basket', 'basket.png')
        this.load.image('logo', 'logo.png')
        this.load.image('net', 'net.png')
        this.load.image('star', 'star.png')
        this.load.image('shadow', 'shadow.png')
        this.load.image('flare', 'flare.png')
        this.load.image('spark', 'spark.png')
    }

    private preloadThemes(): void {
        this.load.setPath('assets/images/theme-game-mode/')
        this.load.image('bg_0', '0/bg_0.png')
        this.load.image('bg_1', '1/bg_1.png')
        this.load.image('bg_2', '2/bg_2.png')
        this.load.image('wall_0', '0/wall_0.png')
        this.load.image('wall_1', '1/wall_1.png')
        this.load.image('wall_2', '2/wall_2.png')
        this.load.image('theme_0', '0.png')
        this.load.image('theme_1', '1.png')
        this.load.image('theme_2', '2.png')
        this.load.image('theme_3', '3.png')
        this.load.image('theme_4', '4.png')
        this.load.image('check', 'check.png')
        this.load.image('check', 'popup.png')
    }

    private preloadAudio(): void {
        this.load.setPath('assets/audio/')
        this.load.audio('bounce', 'Bounce.wav')
        this.load.audio('click', 'Click.wav')
        this.load.audio('game-over', 'GameOver.wav')
        this.load.audio('net', 'Net.wav')
        this.load.audio('shoot', 'Shoot.mp3')
    }
}
