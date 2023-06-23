import 'phaser'
import PreloadScene from './scenes/PreloadScene'
import StartScene from './scenes/StartScene'
import PlayScene from './scenes/PlayScene'
import PauseScene from './scenes/PauseScene'
import GameOverScene from './scenes/GameOverScene'
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './constants'
import SettingScene from './scenes/SettingScene'


export const config = {
    type: Phaser.AUTO,
    parent: 'game',
    transparent: true,
    canvasStyle: 'border: 2px solid black; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5)',
    scale: {
        parent: 'phaser-game',
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
    },
    scene: [PreloadScene, StartScene, PlayScene, PauseScene, GameOverScene, SettingScene],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 980 },
        },
    },
}

window.addEventListener('load', () => {
    const _game = new Phaser.Game(config)
})
