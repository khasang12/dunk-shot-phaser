import 'phaser'
import PreloadScene from './scenes/PreloadScene'
import StartScene from './scenes/StartScene'
import PlayScene from './scenes/PlayScene'
import PauseScene from './scenes/PauseScene'
import GameOverScene from './scenes/GameOverScene'
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './constants'



const config = {
    type: Phaser.AUTO,
    backgroundColor: '#dedede',
    scale: {
        parent: 'phaser-game',
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
    },
    scene: [PreloadScene, StartScene, PlayScene, PauseScene, GameOverScene],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 400 },
        },
    },
}

window.addEventListener('load', () => {
    const _game = new Phaser.Game(config)
})
