import GameStateMachine from '../states/GameStateMachine'

export default class SceneManager {
    private static instance: SceneManager
    public stateMachine: GameStateMachine
    private constructor() {
        this.stateMachine = new GameStateMachine(this, 'scene')

        this.stateMachine
            .addState('preload', {
                onEnter: this.onPreloadEnter,
            })
            .addState('play', {
                onEnter: this.onPlayEnter,
            })
            .addState('start', {
                onEnter: this.onStartEnter,
            })
            .addState('over', {
                onEnter: this.onOverEnter,
            })
            .addState('pause', {
                onEnter: this.onPauseEnter,
            })
            .addState('resume', {
                onEnter: this.onResumeEnter,
            })
            .addState('setting', {
                onEnter: this.onSettingEnter,
            })
            .addState('customize', {
                onEnter: this.onCustomizeEnter,
            })
    }

    public static getInstance(): SceneManager {
        if (!SceneManager.instance) {
            SceneManager.instance = new SceneManager()
        }
        return SceneManager.instance
    }

    public onPreloadEnter(scene: Phaser.Scene) {
        //scene.scene.start('PreloadScene')
    }

    public onPlayEnter(scene: Phaser.Scene, msg?: Object) {
        scene.scene.start('PlayScene', msg)
    }

    public onCustomizeEnter(scene: Phaser.Scene) {
        scene.scene.start('CustomizeScene')
    }

    public onStartEnter(scene: Phaser.Scene) {
        scene.scene.start('StartScene')
    }

    public onSettingEnter(scene: Phaser.Scene, msg?: Object) {
        scene.scene.start('SettingScene', msg)
    }

    public onPauseEnter(scene: Phaser.Scene) {
        scene.scene.switch('PauseScene')
    }

    public onResumeEnter(scene: Phaser.Scene) {
        scene.scene.switch('PlayScene')
    }

    public onOverEnter(scene: Phaser.Scene, msg?: Object) {
        scene.scene.start('GameOverScene', msg)
    }
}
