import { CANVAS_WIDTH } from '../constants'
import { gameManager } from '../game'
import ClickableImage from '../objects/images/ClickableImage'
import Image from '../objects/images/Image'
import { Text } from '../objects/texts/Text'
import { Point } from '../types/point'

export default class CustomizeScene extends Phaser.Scene {
    private lastPointer: Point
    private starText: Text
    private curBalls: string[]

    constructor() {
        super({ key: 'CustomizeScene' })
        this.lastPointer = { x: 0, y: 0 }
        if (localStorage.getItem('balls') == null) {
            localStorage.setItem('balls', JSON.stringify([]))
            this.curBalls = []
        }
    }
    public create() {
        this.curBalls = JSON.parse(<string>localStorage.getItem('balls'))
        console.log(this.curBalls)
        // Enable the camera and set its bounds to the size of the world
        this.cameras.main.setBounds(0, 0, CANVAS_WIDTH, 1900)

        // Listen for mouse events on the game canvas
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (pointer.isDown) {
                // Update the camera position based on the mouse position
                this.cameras.main.scrollX += this.lastPointer.x - pointer.x
                this.cameras.main.scrollY += this.lastPointer.y - pointer.y
            }

            // Save the current mouse position for the next frame
            this.lastPointer.x = pointer.x
            this.lastPointer.y = pointer.y
        })

        const settingsText = new Text({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: 50,
            msg: 'CHOOSE A BALL',
            style: { fontFamily: 'MilkyHoney', fontSize: '45px', color: '#ababab' },
        })

        const starImg = new Image({
            scene: this,
            x: CANVAS_WIDTH - 90,
            y: 50,
            key: 'star',
            scale: 0.32,
        })

        this.starText = new Text({
            scene: this,
            x: CANVAS_WIDTH - 40,
            y: 50,
            msg: <string>localStorage.getItem('star'),
            style: {
                fontFamily: 'MilkyHoney',
                fontSize: '45px',
                color: 'black',
                strokeThickness: 3,
            },
        })

        const x = CANVAS_WIDTH / 2
        this.createBallButton(x, 190, 'ball_1', 10)
        this.createBallButton(x, 320, 'ball_2', 10)
        this.createBallButton(x, 450, 'ball_3', 10)
        this.createBallButton(x, 580, 'ball_4', 10)
        this.createBallButton(x, 710, 'ball_5', 10)
        this.createBallButton(x, 840, 'ball_6', 10)
        this.createBallButton(x, 970, 'ball_7', 10)
        this.createBallButton(x, 1100, 'ball_8', 10)
        this.createBallButton(x, 1230, 'ball_9', 10)
        this.createBallButton(x, 1360, 'ball_10', 10)
        this.createBallButton(x, 1490, 'ball_11', 10)
        this.createBallButton(x, 1620, 'ball_12', 10)
        this.createBallButton(x, 1750, 'ball_locked', 10)
    }

    private createBallButton(x: number, y: number, key: string, price: number) {
        const ball = new ClickableImage({
            scene: this,
            x: x,
            y: y,
            key: key,
            callback: () => {
                gameManager.getSceneManager().stateMachine.setState('start', this, { skin: key })
            },
            scale: 0.3,
        })
        if (!this.curBalls.includes(key)) {
            ball.setAlpha(0.5)
            const getBtn = new ClickableImage({
                scene: this,
                x: x,
                y: y,
                key: 'lock',
                scale: 0.3 * 1.5,
                callback: () => {
                    if (this.purchase(key, price)) {
                        ball.setAlpha(1)
                        getBtn.destroy()
                    }
                },
            })
        }
    }

    private purchase(name: string, price: number): boolean {
        const curStar = parseInt(this.starText.text)
        if (curStar > price) {
            this.curBalls.push(name)
            this.starText.text = (curStar - price).toString()
            localStorage.setItem('balls', JSON.stringify(this.curBalls))
            localStorage.setItem('star', this.starText.text)
            return true
        }
        return false
    }
}
