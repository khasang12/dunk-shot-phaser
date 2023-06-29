import { CANVAS_HEIGHT, CANVAS_WIDTH, COLLISION_EVENTS } from '../constants'
import { gameManager } from '../game'
import EventManager from '../manager/EventManager'
import { InputManager } from '../manager/InputManager'
import Ball from '../objects/game-objects/ball/Ball'
import Basket from '../objects/game-objects/basket/Basket'
import BasketController from '../objects/game-objects/basket/BasketController'
import Star from '../objects/game-objects/star/Star'
import Background from '../objects/images/Background'
import ClickableImage from '../objects/images/ClickableImage'
import Image from '../objects/images/Image'
import FpsText from '../objects/texts/FpsText'
import { Text } from '../objects/texts/Text'
import IObserver from '../types/observer'
import { Sound } from '../types/sound'

type SceneParam = {
    skin: string
}

export default class PlayScene extends Phaser.Scene implements IObserver {
    // Background & Assets & Texts
    private background: Background
    private netAudio: Sound
    private gameOverAudio: Sound
    private shootAudio: Sound
    private clickAudio: Sound
    private starImg: Image
    private wallImg: Image
    private pauseImg: ClickableImage
    private curScoreText: Text
    private scoreText: Text
    private incScoreText: Text
    private perfectText: Text
    private flagText: Text
    private fps: FpsText

    // GameObjects
    private lineGroupBounds: Phaser.Physics.Arcade.Group
    private flag: Phaser.GameObjects.Sprite
    private ball: Ball
    private star: Star

    // Game Control Variables
    private basketCtrl: BasketController
    private eventManager: EventManager
    private inputManager: InputManager

    constructor() {
        super({ key: 'PlayScene' })
        this.basketCtrl = new BasketController()
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

        this.wallImg = new Image({
            scene: this,
            x: W / 2,
            y: H / 2,
            key: 'bg_0',
        })
            .setAlpha(0.6)
            .setScale(0.55)

        this.pauseImg = new ClickableImage({
            scene: this,
            x: 80,
            y: 50,
            key: 'pause',
            callback: () => {
                gameManager.getSceneManager().stateMachine.setState('pause', this)
            },
            scale: 0.12,
        })

        this.starImg = new Image({
            scene: this,
            x: W - 90,
            y: 50,
            key: 'star',
            scale: 0.32,
        }).setDepth(1)

        this.scoreText = new Text({
            scene: this,
            x: W - 40,
            y: 50,
            msg: '0',
            style: {
                fontFamily: 'MilkyHoney',
                fontSize: '45px',
                color: 'black',
                strokeThickness: 3,
            },
        }).setDepth(1)

        this.curScoreText = new Text({
            scene: this,
            x: W / 2,
            y: H / 2 - 120,
            msg: gameManager.getScoreManager().getCurScore().toString(),
            style: { fontSize: '150px', color: '#ababab', fontStyle: 'bold' },
        })

        this.perfectText = new Text({
            scene: this,
            x: -100,
            y: -100,
            msg: 'PERFECT !!',
            style: { fontSize: '30px', color: '#ffa500', fontStyle: 'bold' },
        })

        this.flagText = new Text({
            scene: this,
            x: -200,
            y: -200,
            msg: 'SKYBALL !!',
            style: { fontSize: '30px', color: '#00008b', fontStyle: 'bold' },
        })

        this.incScoreText = new Text({
            scene: this,
            x: -100,
            y: -100,
            msg: '+1',
            style: { fontSize: '50px', color: 'red', fontStyle: 'bold' },
        })

        this.anims.create({
            key: 'flags',
            frames: this.anims.generateFrameNumbers('flag', { frames: [0, 1, 2, 3, 4] }),
            frameRate: 8,
            repeat: -1,
        })
        this.flag = this.add.sprite(CANVAS_WIDTH, -130, 'flags')
        this.flag.play('flags').setScale(5).setAngle(0).setAlpha(0)
    }

    private createWall() {
        const [W, H] = [CANVAS_WIDTH, CANVAS_HEIGHT]
        const line3 = this.add.line(0, 0, 0, -H * 2, 0, H * 2)
        const line4 = this.add.line(W, 0, W, -H * 2, W, H * 2)

        this.lineGroupBounds = this.physics.add.group({
            allowGravity: false,
            immovable: true,
            visible: true,
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
        const curBasket = new Basket({
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
        this.basketCtrl.setCur(curBasket)

        const nextBasket = new Basket({
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

        this.basketCtrl.setNext(nextBasket)

        this.ball = new Ball({
            scene: this,
            x: 125,
            y: CANVAS_HEIGHT / 2 + 200,
            key: 'ball',
            scale: 0.12,
        }).setDepth(1)

        if (data) this.ball.setTexture(data.skin)
    }

    private subscribe() {
        this.input.on('pointerdown', this.inputManager.onPointerDown, this.inputManager)
        this.input.on('pointermove', this.onPointerMove, this)
        this.input.on('pointerup', this.onPointerUp, this)

        this.physics.add.collider(this.ball, [
            this.lineGroupBounds,
            this.basketCtrl.getNext().edgeGroup,
        ])

        this.eventManager.subscribe(this)
        this.eventManager.subscribe(this.ball)
        this.eventManager.subscribe(this.basketCtrl)
    }

    public create(data: SceneParam) {
        // Reset Vars
        gameManager.getScoreManager().reset()
        this.eventManager = new EventManager()
        this.inputManager = new InputManager()
        this.netAudio = this.sound.add('net')
        this.shootAudio = this.sound.add('shoot')
        this.clickAudio = this.sound.add('click')
        this.gameOverAudio = this.sound.add('game-over')

        // Create Objects & Events
        this.createAssets()
        this.createObjects(data)
        this.createWall()
        this.subscribe()
        this.cameras.main.startFollow(this.ball, false, 0, 1, -240, 240)
    }

    private onPointerUp(_pointer: Phaser.Input.Pointer) {
        if (this.inputManager.isDragging()) {
            this.basketCtrl.getCur().stateMachine.setState('idle')
            this.ball.stateMachine.setState(
                'fly',
                this.basketCtrl.getCur().x,
                this.basketCtrl.getCur().y
            )
            this.inputManager.emitDragLeave()
            this.shootAudio.play()
        }
    }

    private onPointerMove(pointer: Phaser.Input.Pointer) {
        if (pointer.isDown && this.inputManager.isDragging()) {
            const [velocity, angle] = this.inputManager.estimateVelocityAndAngle(pointer)
            this.basketCtrl.getCur().stateMachine.setState('snipe', velocity, angle)
            this.ball.stateMachine.setState(
                'snipe',
                velocity,
                Math.PI / 2 - this.basketCtrl.getCur().rotation
            )
        }
    }

    public update(dt: number) {
        this.ball.update(dt)
        this.updateBackground()

        if (this.ball.y > this.basketCtrl.getCur().y + 200)
            this.eventManager.notify(COLLISION_EVENTS['LOWER_BOUND'])
        if (this.basketCtrl.getCur().y - this.ball.y > CANVAS_HEIGHT / 2)
            this.eventManager.notify(COLLISION_EVENTS['UPPER_BOUND'])
        if (
            this.ball.isFlyingDown() &&
            this.physics.collide(this.ball, this.basketCtrl.getCur().bodyGroup)
        )
            this.eventManager.notify(COLLISION_EVENTS['CURRENT_BASKET'])
        if (
            this.physics.overlap(this.ball, this.basketCtrl.getNext().openGroup) &&
            this.physics.overlap(this.ball, this.basketCtrl.getNext().bodyGroup)
        )
            this.eventManager.notify(COLLISION_EVENTS['NEXT_BASKET'])
        if (this.physics.collide(this.ball, this.basketCtrl.getNext().bodyGroup))
            this.eventManager.notify(COLLISION_EVENTS['OBSTACLE'])
        if (this.ball.isOutOfBounds()) {
            this.eventManager.notify(COLLISION_EVENTS['WALL'])
        }
        if (this.physics.overlap(this.ball, this.star)) {
            this.eventManager.notify(COLLISION_EVENTS['STAR'])
        }
    }

    private updateBackground() {
        this.fps.update()
        this.background.tilePositionY -= 1

        this.pauseImg.setY(this.cameras.main.scrollY + 50)
        this.fps.setY(this.cameras.main.scrollY + 50)
        this.starImg.setY(this.cameras.main.scrollY + 50)
        this.scoreText.setY(this.cameras.main.scrollY + 50)
        this.flag.setY(this.cameras.main.scrollY + CANVAS_WIDTH)
        this.lineGroupBounds.setY(this.cameras.main.scrollY)
        this.curScoreText.setY(this.cameras.main.scrollY + CANVAS_WIDTH / 2)
        this.wallImg.setY(this.cameras.main.scrollY + CANVAS_HEIGHT / 2)
        this.background.setY(this.cameras.main.scrollY + CANVAS_HEIGHT / 2)
    }

    public onNotify(e: number): void {
        switch (e) {
            case COLLISION_EVENTS['UPPER_BOUND']:
                this.onHitUpperBound()
                break
            case COLLISION_EVENTS['LOWER_BOUND']:
                this.onHitLowerBound()
                break
            case COLLISION_EVENTS['CURRENT_BASKET']:
                this.onHitCurrent()
                break
            case COLLISION_EVENTS['NEXT_BASKET']:
                this.onHitNext()
                break
            case COLLISION_EVENTS['STAR']:
                this.onHitStar()
                break
        }
    }

    private onHitLowerBound() {
        this.gameOverAudio.play()
        gameManager.getScoreManager().saveScoreToLocalStorage()
        this.firebase.addHighScore(
            this.firebase.getUser() ? this.firebase.getUser().displayName : 'test',
            gameManager.getScoreManager().getCurScore()
        )
        this.scene.start('GameOverScene', {
            data: gameManager.getScoreManager().getCurScore(),
        })
        if (this.flag) this.flag.destroy()
    }

    private onHitUpperBound() {
        this.tweens.add({
            targets: this.flag,
            alpha: 1,
            angle: 270,
            ease: 'Linear',
            duration: 200,
        })
    }

    private onHitCurrent() {
        this.ball.stateMachine.setState(
            'idle',
            this.basketCtrl.getCur().x,
            this.basketCtrl.getCur().y
        )
        this.netAudio.play()
        this.flag.setAlpha(0)
    }

    private onHitStar() {
        gameManager.getScoreManager().incrementStar()
        this.clickAudio.play()
        this.scoreText.setText(gameManager.getScoreManager().getCurStar().toString())
        this.star.stateMachine.setState('disable')
    }

    private onHitNext() {
        if (this.ball.body) {
            let bonus = 0
            const veloAngle = Math.atan2(this.ball.body?.velocity.y, this.ball.body?.velocity.x)
            this.netAudio.play()
            bonus += 1
            this.ball.stateMachine.setState(
                'idle',
                this.basketCtrl.getNext().x,
                this.basketCtrl.getNext().y,
                gameManager.getScoreManager().getCurScore()
            )
            if (this.basketCtrl.getNext().rotation - -veloAngle <= 0.15) {
                bonus += 1
                this.perfectText.emitTextFadeInOut(
                    this.basketCtrl.getNext().x,
                    this.basketCtrl.getNext().y - 140,
                    1000
                )
            }

            if (this.flag.alpha == 1) {
                bonus += 1
                this.flagText.emitTextFadeInOut(
                    this.basketCtrl.getNext().x,
                    this.basketCtrl.getNext().y - 100,
                    1000
                )
                this.flag.setAlpha(0)
            }

            if (this.ball.isPowerUp()) bonus += 1
            this.incScoreText.setText('+' + bonus.toString())
            gameManager.getScoreManager().incrementScore(bonus)
            this.incScoreText.emitTextFadeInOut(
                this.basketCtrl.getNext().x,
                this.basketCtrl.getNext().y - 65,
                1000
            )

            const curScore = gameManager.getScoreManager().getCurScore()
            this.curScoreText.text = curScore.toString()
            this.time.delayedCall(0, () => {
                this.basketCtrl.getNext().moveFollower(this.star)
                this.basketCtrl.getCur().moveFollower(this.ball)
                this.star.stateMachine.setState('enable')
            })
        }
    }
}
