import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../constants'
import Ball from '../objects/game-objects/ball/Ball'
import Basket from '../objects/game-objects/basket/Basket'
import Star from '../objects/game-objects/star/Star'
import Background from '../objects/images/Background'
import ClickableImage from '../objects/images/ClickableImage'
import Image from '../objects/images/Image'
import FpsText from '../objects/texts/FpsText'
import { Text } from '../objects/texts/Text'
import StateMachine from '../states/StateMachine'
import { Point } from '../types/point'
import { Sound } from '../types/sound'

type SceneParam = {
    skin: string
}

export default class PlayScene extends Phaser.Scene {
    // Background & Assets & Texts
    private background: Background
    private netAudio: Sound
    private gameOverAudio: Sound
    private shootAudio: Sound
    private clickAudio: Sound
    private starImg: Image
    private pauseImg: ClickableImage
    private curScoreText: Text
    private scoreText: Text
    private incScoreText: Text
    private perfectText: Text
    private fps: FpsText

    // GameObjects
    private curBasket: Basket
    private nextBasket: Basket
    private ball: Ball
    private star: Star
    private vision: Phaser.GameObjects.Image

    // Game Controller Variables
    private score: number
    private starCnt: number
    private isGameEnd = false
    private dragStart: Point | null
    private lineGroupBounds: Phaser.Physics.Arcade.Group
    private lineGroupUpperBounds: Phaser.Physics.Arcade.Group
    private stateMachine: StateMachine

    constructor() {
        super({ key: 'PlayScene' })

        this.score = 0

        // Restart 'star'
        if (!localStorage.getItem('star')) {
            localStorage.setItem('star', '0')
            this.starCnt = 0
        } else {
            this.starCnt = parseInt(<string>localStorage.getItem('star'))
        }
    }

    public create(data: SceneParam) {
        // Reset Vars
        this.score = 0
        this.isGameEnd = false
        this.starCnt = 0
        this.netAudio = this.sound.add('net')
        this.shootAudio = this.sound.add('shoot')
        this.clickAudio = this.sound.add('click')
        this.gameOverAudio = this.sound.add('game-over')

        // Create Objects & Events
        this.createAssets()
        this.createWall()
        this.createObjects(data)
        this.createEventListeners()
    }

    public update(dt: number) {
        if (this.vision) {
            this.vision.x = this.ball.x
            this.vision.y = this.ball.y
        }
        this.ball.update(dt)
        this.updateBackground()
        if (this.ball.y > CANVAS_HEIGHT) {
            this.onHitLowerBound()
        }
        if (
            (this.ball.body?.velocity.y || 0) > 0 &&
            this.physics.collide(this.ball, this.curBasket.bodyGroup) &&
            this.ball.body?.touching.down
        ) {
            this.onHitCurrentBasket()
        }
        if (this.physics.collide(this.ball, this.nextBasket.bodyGroup)) {
            this.onHitNextBasket()
        }
    }

    private onPointerDown(pointer: Phaser.Input.Pointer) {
        this.dragStart = { x: pointer.x, y: pointer.y }
    }

    private onPointerUp(pointer: Phaser.Input.Pointer) {
        if (this.dragStart) {
            const [velocity, angle] = this.estimateVelocityAndAngle(pointer)
            this.curBasket.stateMachine.setState('idle')
            
            this.ball.stateMachine.setState(
                'fly',
                this.curBasket.x,
                this.curBasket.y,
                angle + Math.PI,
                velocity
            )
            this.dragStart = null
            this.shootAudio.play()
        }
    }

    private onPointerMove(pointer: Phaser.Input.Pointer) {
        if (pointer.isDown) {
            const [velocity, angle] = this.estimateVelocityAndAngle(pointer)
            this.curBasket.stateMachine.setState('snipe', angle)
            this.ball.stateMachine.setState(
                'snipe',
                velocity,
                Math.PI / 2 - this.curBasket.rotation
            )
        }
    }

    private estimateVelocityAndAngle(pointer: Phaser.Input.Pointer): number[] {
        if (this.dragStart) {
            // calculate the angle between the bird and the pointer
            const angle = Phaser.Math.Angle.Between(
                this.dragStart.x,
                this.dragStart.y,
                pointer.x,
                pointer.y
            )

            // Calculate the distance and angle between the starting position of the drag and the current pointer position
            const distance = Phaser.Math.Distance.Between(
                this.dragStart.x,
                this.dragStart.y,
                pointer.x,
                pointer.y
            )

            return [distance, angle]
        }
        return [0, 0]
    }

    private createAssets() {
        const [W, H] = [CANVAS_WIDTH, CANVAS_HEIGHT]

        this.fps = new FpsText(this)

        this.background = new Background({
            scene: this,
            x: W / 2,
            y: H / 2,
            w: 4096,
            h: 4096,
            key: 'wall_0',
            scale: 0.45,
        })

        const wallUp = new Image({
            scene: this,
            x: W / 2,
            y: -H + 25,
            key: 'bg_1',
        }).setAlpha(0.6)

        const wallImg = new Image({
            scene: this,
            x: W / 2,
            y: H / 2,
            key: 'bg_0',
        })
        wallImg.setAlpha(0.6).setScale(0.55)

        this.pauseImg = new ClickableImage({
            scene: this,
            x: 80,
            y: 50,
            key: 'pause',
            callback: () => {
                this.scene.switch('PauseScene')
            },
            scale: 0.12,
        })

        this.starImg = new Image({
            scene: this,
            x: W - 90,
            y: 50,
            key: 'star',
            scale: 0.32,
        })

        this.scoreText = new Text({
            scene: this,
            x: W - 40,
            y: 50,
            msg: this.starCnt.toString(),
            style: {
                fontFamily: 'MilkyHoney',
                fontSize: '45px',
                color: 'black',
                strokeThickness: 3,
            },
        })

        this.curScoreText = new Text({
            scene: this,
            x: W / 2,
            y: H / 2 - 120,
            msg: this.score.toString(),
            style: { fontSize: '150px', color: '#ababab', fontStyle: 'bold' },
        })

        this.perfectText = new Text({
            scene: this,
            x: -100,
            y: -100,
            msg: 'PERFECT!!',
            style: { fontSize: '25px', color: '#ffa500', fontStyle: 'bold' },
        })

        this.incScoreText = new Text({
            scene: this,
            x: -100,
            y: -100,
            msg: '+1',
            style: { fontSize: '50px', color: 'red', fontStyle: 'bold' },
        })
    }

    private createWall() {
        const [W, H] = [CANVAS_WIDTH, CANVAS_HEIGHT]
        const line1 = this.add.line(0, -5 * H, 0, -5 * H, 0, 5 * H)
        const line2 = this.add.line(W, -5 * H, W, -5 * H, W, 5 * H)
        const line3 = this.add.line(0, 0, 0, 0, 0, H * 2)
        const line4 = this.add.line(W, 0, W, 0, W, H * 2)

        this.lineGroupUpperBounds = this.physics.add.group({
            allowGravity: false,
            immovable: true,
            visible: true,
            bounceX: 1,
            bounceY: 1,
        })
        this.lineGroupUpperBounds.add(line1)
        this.lineGroupUpperBounds.add(line2)

        this.lineGroupBounds = this.physics.add.group({
            allowGravity: false,
            immovable: true,
            visible: true,
            collideWorldBounds: true,
            bounceX: 1,
            bounceY: 1,
        })
        this.lineGroupBounds.add(line3)
        this.lineGroupBounds.add(line4)
    }

    private createObjects(data: SceneParam) {
        this.star = new Star({
            scene: this,
            x: CANVAS_WIDTH - 90,
            y: 50,
            key: 'star',
            scale: 0.32,
        })

        this.curBasket = new Basket({
            scene: this,
            x: 130,
            y: CANVAS_HEIGHT / 2 + 200,
            key: 'basket',
            callback: (x: number, y: number, angle: number, speed: number) => {
                this.ball.stateMachine.setState('fly', x, y, angle, speed)
            },
            scale: 0.65,
        })
            .setDepth(2)
            .setMaxVelocity(0, 0)

        this.nextBasket = new Basket({
            scene: this,
            x: CANVAS_WIDTH - 140,
            y: CANVAS_HEIGHT / 2 - 200,
            key: 'basket',
            callback: (x: number, y: number, angle: number, speed: number) => {
                this.ball.stateMachine.setState('fly', x, y, angle, speed)
            },
            scale: 0.65,
        })
            .setDepth(2)
            .setMaxVelocity(0, 0)

        this.ball = new Ball({
            scene: this,
            x: 125,
            y: CANVAS_HEIGHT / 2 + 200,
            key: 'ball',
            scale: 0.12,
        }).setDepth(1)

        if (data) this.ball.setTexture(data.skin)
    }

    private createEventListeners() {
        this.input.on('pointerdown', this.onPointerDown, this)
        this.input.on('pointermove', this.onPointerMove, this)
        this.input.on('pointerup', this.onPointerUp, this)

        this.physics.add.collider(this.ball, [
            this.lineGroupUpperBounds,
            this.lineGroupBounds,
            this.nextBasket.edgeGroup,
        ])
    }

    private updateBackground() {
        this.fps.update()
        this.background.tilePositionY -= 1
        this.cameras.main.setScroll(this.cameras.main.scrollX, this.ball.y - this.curBasket.y)
    }

    private onHitLowerBound() {
        this.gameOverAudio.play()
        this.scene.start('GameOverScene', { data: this.score })
        this.saveScore()
        this.isGameEnd = true
    }

    private onHitCurrentBasket() {
        this.curBasket.reset()
        this.ball.stateMachine.setState('idle', this.curBasket.x, this.curBasket.y)
        this.netAudio.play()
    }

    private onHitNextBasket() {
        if (this.ball.body) {
            const veloAngle = Math.atan2(this.ball.body?.velocity.y, this.ball.body?.velocity.x)
            this.netAudio.play()
            this.score += 1
            this.ball.stateMachine.setState(
                'idle',
                this.nextBasket.x,
                this.nextBasket.y,
                this.score
            )
            if (this.nextBasket.rotation - -veloAngle <= 0.15) {
                this.score += 1
                this.perfectText.emitTextFadeInOut(this.nextBasket.x, this.nextBasket.y - 50, 1000)
                this.incScoreText.setText('+2')
                if (Math.abs(this.ball.getBounds().centerX - this.star.getBounds().centerX) < 50) {
                    this.starCnt++
                    this.clickAudio.play()
                    this.scoreText.text = this.starCnt.toString()
                }
            } else {
                this.incScoreText.setText('+1')
            }

            this.incScoreText.emitTextFadeInOut(this.nextBasket.x, this.nextBasket.y, 1000)
            this.curScoreText.text = this.score.toString()
            this.curBasket.stateMachine.setState('transit')
            this.nextBasket.stateMachine.setState('transit')
            this.curBasket.resetPositionByBasketPosition(this.star)
            this.nextBasket.resetPositionByBasketPosition(this.ball)

            const temp = this.curBasket
            this.curBasket = this.nextBasket
            this.nextBasket = temp
        }
    }

    private saveScore() {
        const curHighScore = localStorage.getItem('high-score')
        if (curHighScore == null) {
            localStorage.setItem('high-score', this.score.toString())
        } else {
            localStorage.setItem(
                'high-score',
                Math.max(parseInt(curHighScore), this.score).toString()
            )
        }
        localStorage.setItem(
            'star',
            (
                (localStorage.getItem('star')
                    ? parseInt(<string>localStorage.getItem('star'))
                    : 0) + this.starCnt
            ).toString()
        )
    }
}
