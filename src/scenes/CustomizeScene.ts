import { CANVAS_WIDTH } from '../constants'
import ClickableImage from '../objects/images/ClickableImage'
import { Text } from '../objects/texts/Text'
import { Point } from '../types/point'

export default class CustomizeScene extends Phaser.Scene {
    private lastPointer: Point
    constructor() {
        super({ key: 'CustomizeScene' })
        this.lastPointer = { x: 0, y: 0 }
    }
    public create() {
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

        const ball1 = new ClickableImage({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: 190,
            key: 'ball_1',
            callback: () => {
                // Switch to the game scene
                this.scene.start('StartScene', { skin: 'ball_1' })
            },
            scale: 0.3,
        })

        const ball2 = new ClickableImage({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: 320,
            key: 'ball_2',
            callback: () => {
                // Switch to the game scene
                this.scene.start('StartScene', { skin: 'ball_2' })
            },
            scale: 0.3,
        })

        const ball3 = new ClickableImage({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: 450,
            key: 'ball_3',
            callback: () => {
                // Switch to the game scene
                this.scene.start('StartScene', { skin: 'ball_3' })
            },
            scale: 0.3,
        })

        const ball4 = new ClickableImage({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: 580,
            key: 'ball_4',
            callback: () => {
                // Switch to the game scene
                this.scene.start('StartScene', { skin: 'ball_4' })
            },
            scale: 0.3,
        })

        const ball5 = new ClickableImage({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: 710,
            key: 'ball_5',
            callback: () => {
                // Switch to the game scene
                this.scene.start('StartScene', { skin: 'ball_5' })
            },
            scale: 0.3,
        })

        const ball6 = new ClickableImage({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: 840,
            key: 'ball_6',
            callback: () => {
                // Switch to the game scene
                this.scene.start('StartScene', { skin: 'ball_6' })
            },
            scale: 0.3,
        })

        const ball7 = new ClickableImage({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: 970,
            key: 'ball_7',
            callback: () => {
                // Switch to the game scene
                this.scene.start('StartScene', { skin: 'ball_7' })
            },
            scale: 0.3,
        })

        const ball8 = new ClickableImage({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: 1100,
            key: 'ball_8',
            callback: () => {
                // Switch to the game scene
                this.scene.start('StartScene', { skin: 'ball_8' })
            },
            scale: 0.3,
        })

        const ball9 = new ClickableImage({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: 1230,
            key: 'ball_9',
            callback: () => {
                // Switch to the game scene
                this.scene.start('StartScene', { skin: 'ball_9' })
            },
            scale: 0.3,
        })

        const ball10 = new ClickableImage({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: 1360,
            key: 'ball_10',
            callback: () => {
                // Switch to the game scene
                this.scene.start('StartScene', { skin: 'ball_10' })
            },
            scale: 0.3,
        })

        const ball11 = new ClickableImage({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: 1490,
            key: 'ball_11',
            callback: () => {
                // Switch to the game scene
                this.scene.start('StartScene', { skin: 'ball_11' })
            },
            scale: 0.3,
        })

        const ball12 = new ClickableImage({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: 1620,
            key: 'ball_12',
            callback: () => {
                // Switch to the game scene
                this.scene.start('StartScene', { skin: 'ball_12' })
            },
            scale: 0.3,
        })

        const ball_lock = new ClickableImage({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: 1750,
            key: 'ball_locked',
            callback: () => {
                // Switch to the game scene
                this.scene.start('StartScene', { skin: 'ball_locked' })
            },
            scale: 0.3,
        })
    }
}
