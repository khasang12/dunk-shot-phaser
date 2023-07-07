import { CANVAS_HEIGHT, CANVAS_WIDTH, COLLISION_EVENTS } from '../constants'
import { gameManager } from '../game'
import EventManager from '../manager/EventManager'
import { InputManager } from '../manager/InputManager'
import SoundManager from '../manager/SoundManager'
import Ball from '../objects/game-objects/ball/Ball'
import StaticBall from '../objects/game-objects/ball/StaticBall'
import Basket from '../objects/game-objects/basket/Basket'
import BasketController from '../objects/game-objects/basket/BasketController'
import ClickableImage from '../objects/images/ClickableImage'
import Image from '../objects/images/Image'
import { Text } from '../objects/texts/Text'
import IObserver from '../types/observer'
import { AnimatedTiles } from '../plugins/AnimatedTiles'

type SceneParam = {
    skin: string
}

export default class ChallengeScene extends Phaser.Scene implements IObserver {
    // Background & Assets & Texts
    private map: Phaser.Tilemaps.Tilemap
    private tileset: Phaser.Tilemaps.Tileset
    private background: Phaser.Tilemaps.TilemapLayer
    private foreground: Phaser.Tilemaps.TilemapLayer

    private starImg: Image
    private pauseImg: ClickableImage
    private curScoreText: Text
    private incScoreText: Text
    private levelText: Text
    private bounceText: Text

    // GameObjects
    private ball: Ball
    private bouncingBalls: Phaser.GameObjects.Group

    // Game Control Variables
    private latestBounceCnt: number
    private curScore: number
    private nextLevel: string
    private basketCtrl: BasketController
    private eventManager: EventManager
    private inputManager: InputManager
    private soundManager: SoundManager
    private animatedTiles!: AnimatedTiles

    constructor() {
        super({ key: 'ChallengeScene' })
        this.basketCtrl = new BasketController()
    }

    private createMap() {
        // create our tilemap from Tiled JSON
        this.map = this.make.tilemap({ key: this.registry.get('level') })
        // add our tileset and layers to our tilemap
        this.tileset = <Phaser.Tilemaps.Tileset>this.map.addTilesetImage('tiles')
        this.background = <Phaser.Tilemaps.TilemapLayer>(
            this.map.createLayer('background', this.tileset, 0, 0)
        )
        this.background.setName('background')

        // Init animations on map
        this.animatedTiles.init(this.map)
    }

    private createAssets() {
        const [W, H] = [CANVAS_WIDTH, CANVAS_HEIGHT]

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

        this.levelText = new Text({
            scene: this,
            x: W / 2,
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
            msg: '0',
            style: { fontSize: '100px', color: '#b31312', fontStyle: 'bold' },
        })

        this.bounceText = new Text({
            scene: this,
            x: -200,
            y: -200,
            msg: 'PERFECT !!',
            style: { fontSize: '40px', color: '#5021FD', fontStyle: 'bold' },
        })
    }

    private createObjects(data: SceneParam) {
        this.bouncingBalls = this.add.group({
            runChildUpdate: true,
        })

        const curBasket = new Basket({
            scene: this,
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2 + 300,
            key: 'tree-basket',
            callback: (x: number, y: number, angle: number, speed: number) => {
                this.ball.stateMachine.setState('fly', x, y, angle, speed)
            },
            scale: 0.5,
        })
            .setDepth(2)
            .setMaxVelocity(0, 0)

        const nextBasket = new Basket({
            scene: this,
            x: CANVAS_WIDTH - 140,
            y: CANVAS_HEIGHT / 2 - 200,
            key: 'gold-basket',
            callback: (x: number, y: number, angle: number, speed: number) => {
                this.ball.stateMachine.setState('fly', x, y, angle, speed)
            },
            scale: 0.5,
        })
            .setDepth(2)
            .setMaxVelocity(0, 0)

        const midBasket = new Basket({
            scene: this,
            x: CANVAS_WIDTH - 140,
            y: CANVAS_HEIGHT / 2 - 200,
            key: 'tree-basket',
            callback: (x: number, y: number, angle: number, speed: number) => {
                this.ball.stateMachine.setState('fly', x, y, angle, speed)
            },
            scale: 0.5,
        })
            .setDepth(2)
            .setMaxVelocity(0, 0)

        this.basketCtrl.setCur(curBasket)
        this.basketCtrl.setNext(nextBasket)
        this.basketCtrl.setMid(midBasket)

        this.ball = new Ball({
            scene: this,
            x: 125,
            y: CANVAS_HEIGHT / 2 + 200,
            key: 'ball',
            scale: 0.12,
        }).setDepth(1)

        if (data) this.ball.setTexture(data.skin)
        this.physics.world.setFPS(60)

        // Get TileMap information
        const objects = this.map.getObjectLayer('objects')?.objects as any[]
        objects.forEach((object) => {
            if (object.type === 'ball') {
                this.bouncingBalls.add(
                    new StaticBall({
                        scene: this,
                        x: object.x,
                        y: object.y,
                        key: 'bouncer',
                    }).setName(object.name)
                )
            }
            if (object.type === 'shooting_ball') {
                this.ball.setX(object.x)
                this.ball.setY(object.y)
            }
            if (object.type === 'basket') {
                if (object.name === 'curBasket') {
                    this.basketCtrl.getCur().setPosition(object.x, object.y)
                    this.basketCtrl.getCur().updateBody()
                } else if (object.name === 'midBasket') {
                    this.basketCtrl.getMid().setPosition(object.x, object.y)
                    this.basketCtrl.getMid().updateBody()
                } else {
                    this.basketCtrl.getNext().setPosition(object.x, object.y)
                    this.basketCtrl.getNext().updateBody()
                    this.nextLevel = object.properties[0].value
                }
            }
        })
    }

    private subscribe() {
        this.input.on('pointerdown', this.inputManager.onPointerDown, this.inputManager)
        this.input.on('pointermove', this.onPointerMove, this)
        this.input.on('pointerup', this.onPointerUp, this)

        this.eventManager.subscribe(this)
        this.eventManager.subscribe(this.ball)
        this.eventManager.subscribe(this.basketCtrl)
        this.physics.add.collider(this.ball, this.foreground)
        this.physics.add.collider(this.ball, this.bouncingBalls, (_ball, boun) => {
            const bounce = boun as StaticBall
            if (!bounce.getIsVibrating()) {
                this.latestBounceCnt += 1
                bounce.vibrate()
            }
        })
    }

    public create(data: SceneParam) {
        // Reset Vars
        this.latestBounceCnt = 0
        this.curScore = 0
        this.eventManager = new EventManager()
        this.inputManager = InputManager.getInstance()
        this.soundManager = SoundManager.getInstance()
        this.soundManager.addSound('net', this.sound.add('net'))
        this.soundManager.addSound('shoot', this.sound.add('shoot'))
        this.soundManager.addSound('click', this.sound.add('click'))
        this.soundManager.addSound('over', this.sound.add('game-over'))

        // Create Objects & Events
        this.createMap()
        this.createObjects(data)
        this.createAssets()
        this.subscribe()
        this.cameras.main.startFollow(this.ball, false, 0, 0.1, 20, 450)

        this.levelText.setText(
            this.registry.get('level').toUpperCase() +
                '- Best Bounce: ' +
                (localStorage.getItem(this.registry.get('level')) || '0')
        )
    }

    private onPointerUp(_pointer: Phaser.Input.Pointer) {
        if (this.inputManager.isDragging() && !this.ball.isFlying()) {
            this.basketCtrl.getCur().stateMachine.setState('idle')
            this.ball.stateMachine.setState(
                'fly',
                this.basketCtrl.getCur().x,
                this.basketCtrl.getCur().y
            )
            this.inputManager.emitDragLeave()
            this.soundManager.playSound('shoot')
        }
    }

    private onPointerMove(pointer: Phaser.Input.Pointer) {
        if (pointer.isDown && this.inputManager.isDragging() && !this.ball.isFlying()) {
            const [velocity, angle] = this.inputManager.estimateVelocityAndAngle(pointer)
            this.basketCtrl.getCur().stateMachine.setState('snipe', velocity, angle)
            this.ball.stateMachine.setState(
                'snipe',
                velocity,
                Math.PI / 2 - this.basketCtrl.getCur().rotation
            )
        }
    }

    public update(time: number, dt: number) {
        if (!this.sys.isActive()) {
            console.log('not active yet')
            return
        }

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
            this.physics.overlap(this.ball, this.basketCtrl.getMid().openGroup) &&
            this.physics.overlap(this.ball, this.basketCtrl.getMid().bodyGroup)
        )
            this.eventManager.notify(COLLISION_EVENTS['MID_BASKET'])
        if (
            this.physics.overlap(this.ball, this.basketCtrl.getNext().openGroup) &&
            this.physics.overlap(this.ball, this.basketCtrl.getNext().bodyGroup)
        )
            this.eventManager.notify(COLLISION_EVENTS['NEXT_CHALLENGE_BASKET'])
        if (this.physics.collide(this.ball, this.basketCtrl.getNext().bodyGroup))
            this.eventManager.notify(COLLISION_EVENTS['OBSTACLE'])
        if (this.physics.collide(this.ball, this.basketCtrl.getMid().bodyGroup))
            this.eventManager.notify(COLLISION_EVENTS['OBSTACLE_MID'])
        if (this.ball.isOutOfBounds()) {
            this.eventManager.notify(COLLISION_EVENTS['WALL'])
        }

        this.animatedTiles.updateAnimatedTiles()
    }

    private updateBackground() {
        const cameraY = this.cameras.main.scrollY
        this.curScoreText.setY(cameraY + 170)
        this.pauseImg.setY(cameraY + 50)
        this.levelText.setY(cameraY + 50)
        this.background.setY(cameraY - 30)
    }

    public onNotify(e: number): void {
        switch (e) {
            case COLLISION_EVENTS['LOWER_BOUND']:
                this.onHitLowerBound()
                break
            case COLLISION_EVENTS['CURRENT_BASKET']:
                this.onHitCurrent()
                break
            case COLLISION_EVENTS['MID_BASKET']:
                this.onHitMid()
                break
            case COLLISION_EVENTS['NEXT_CHALLENGE_BASKET']:
                this.onHitNext()
                break
        }
    }

    private onHitLowerBound() {
        this.latestBounceCnt = 0
        this.soundManager.playSound('over')
        const curScore = gameManager.getScoreManager().getCurScore()
        if (curScore == 0) {
            this.ball.setPosition(this.basketCtrl.getCur().x, this.basketCtrl.getCur().y - 20)
            this.ball.stateMachine.setState(
                'idle',
                this.basketCtrl.getCur().x,
                this.basketCtrl.getCur().y
            )
            return
        }

        gameManager.getScoreManager().saveScoreToLocalStorage()
        this.firebase.addHighScore(
            this.firebase.getUser() ? this.firebase.getUser().displayName : 'test',
            gameManager.getScoreManager().getCurScore()
        )
        this.scene.start('GameOverScene', {
            data: gameManager.getScoreManager().getCurScore(),
        })
    }

    private onHitCurrent() {
        this.latestBounceCnt = 0
        this.ball.stateMachine.setState(
            'idle',
            this.basketCtrl.getCur().x,
            this.basketCtrl.getCur().y
        )
        this.soundManager.playSound('net')
    }

    private onHitMid() {
        this.bounceText.setText('BOUNCE\n  +' + this.latestBounceCnt.toString())
        this.bounceText.emitTextFadeInOut(
            this.basketCtrl.getMid().x,
            this.basketCtrl.getMid().y - 100,
            1000
        )

        this.ball.stateMachine.setState(
            'idle',
            this.basketCtrl.getMid().x,
            this.basketCtrl.getMid().y
        )
        this.soundManager.playSound('net')

        this.curScore += this.latestBounceCnt
        console.log(this.curScore)
        this.curScoreText.setText(this.curScore.toString())
        this.latestBounceCnt = 0
    }

    private onHitNext() {
        if (this.ball.body) {
            this.soundManager.playSound('net')

            this.bounceText.setText('BOUNCE\n  +' + this.latestBounceCnt.toString())
            this.bounceText.emitTextFadeInOut(
                this.basketCtrl.getNext().x,
                this.basketCtrl.getNext().y - 100,
                1000
            )

            this.curScore += this.latestBounceCnt
            this.curScoreText.setText(this.curScore.toString())
            this.latestBounceCnt = 0

            this.ball.stateMachine.setState(
                'idle',
                this.basketCtrl.getNext().x,
                this.basketCtrl.getNext().y
            )

            if (this.curScore > parseInt(localStorage.getItem(this.registry.get('level')) || '0'))
                localStorage.setItem(this.registry.get('level'), this.curScore.toString())

            this.time.delayedCall(1000, () => {
                if (this.nextLevel != '') {
                    this.registry.set('level', this.nextLevel)
                    this.nextLevel = ''
                    this.scene.restart()
                } else gameManager.getSceneManager().stateMachine.setState('start', this)
            })
        }
    }
}
