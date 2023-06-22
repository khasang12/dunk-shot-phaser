import { CANVAS_HEIGHT } from '../../constants'
import { IGameObject } from '../../types/object'
import { Point } from '../../types/point'
import { Sound } from '../../types/sound'
import Ball from './Ball'
import BodyObject from './BodyObject'
import Star from './Star'

let lock = true

export default class Basket extends BodyObject {
    private trajectory: Point[]
    private points: Phaser.GameObjects.Graphics
    private dragStart: boolean
    private callback: (x: number, y: number, a: number, b: number) => void
    private power: number
    private ang: number
    private shootAudio: Sound

    constructor(o: IGameObject) {
        super(o)
        // Enable input events for the image
        this.setInteractive()

        // Add event listeners for the image click/touch events
        this.on('pointerdown', this.onPointerDown, this)
        this.on('pointermove', this.onPointerMove, this)
        this.on('pointerup', this.onPointerUp, this)

        if (o.callback) this.callback = o.callback

        this.scene.physics.add.existing(this)

        this.shootAudio = this.scene.sound.add('shoot')

        this.scene.add.existing(this)
    }

    public onPointerDown(pointer: Phaser.Input.Pointer) {
        //this.dragStart = { x: pointer.x, y: pointer.y }
        const distance = Phaser.Math.Distance.Between(this.x, this.y, pointer.x, pointer.y)
        // if the pointer is within a certain distance from the bird
        if (distance < 50) {
            // set the bird to be dragged
            this.dragStart = true
        }
    }

    public onPointerUp(pointer: Phaser.Input.Pointer) {
        if (this.dragStart) {
            // calculate the angle between the bird and the pointer
            const angle = Phaser.Math.Angle.Between(this.x, this.y, pointer.x, pointer.y)

            // apply velocity to the this based on the angle and distance
            const distance = Phaser.Math.Distance.Between(this.x, this.y, pointer.x, pointer.y)
            const velocity = distance

            // set the this to not be dragged anymore
            this.setScale(this.scaleX, this.scaleX)
            this.callback(this.x, this.y, -angle, velocity)
            this.dragStart = false
            this.shootAudio.play()
        }
    }

    public onPointerMove(pointer: Phaser.Input.Pointer) {
        // Mutex Lock
        if (lock) {
            lock = false

            if (pointer.isDown) {
                // calculate the angle between the bird and the pointer
                const angle = Phaser.Math.Angle.Between(this.x, this.y, pointer.x, pointer.y)

                // Set the object's rotation to the calculated angle
                this.rotation = angle + Math.PI / 2

                // Calculate the distance and angle between the starting position of the drag and the current pointer position
                const distance = Phaser.Math.Distance.Between(this.x, this.y, pointer.x, pointer.y)
                this.setTrajectory(Math.max(50, distance * 50), -angle)

                this.setScale(this.scaleX, Math.min(this.scaleY * 1.2, 0.8))
            }

            setTimeout(function () {
                lock = true
            }, 300) // wait for 300ms before allowing another request
        }
    }

    public setTrajectory(power: number, angle: number) {
        this.trajectory = []
        // Create a new graphics object
        this.points = this.scene.add.graphics()
        // Set the fill color for the circles
        this.points.fillStyle(0xffa500, 1)
        for (let i = 0; i < 8; i++) {
            const timeSlice = i / 40
            const x = this.x + power * Math.cos(angle) * timeSlice
            const y = this.y - power * Math.sin(angle) * timeSlice + 0.5 * 9.8 * timeSlice ** 2
            this.trajectory.push({ x, y })
        }
        // Loop through each point in the trajectory and draw a circle at that position
        for (let i = 0; i < 8; i++) {
            const point = this.trajectory[i]
            this.points.fillCircle(point.x, point.y, 10)
        }

        const tween = this.scene.tweens.add({
            targets: this.points,
            alpha: 0,
            duration: 280,
        })

        tween.setCallback(
            'onComplete',
            function () {
                tween.destroy()
            },
            []
        )
    }

    private transition(obj: Phaser.Physics.Arcade.Sprite, destX: number, destY: number) {
        this.scene.tweens.add({
            targets: obj,
            x: destX,
            y: destY,
            duration: 1000,
            ease: 'easeInOutExpo',
            onComplete: () => {
                console.log('Object move complete!')
            },
        })
    }

    public resetPosition(obj: Ball | Star | null) {
        const newY =
            this.y > CANVAS_HEIGHT / 2
                ? Math.floor(Math.random() * (CANVAS_HEIGHT / 2 - 100 + 1)) + 100
                : Math.floor(Math.random() * (CANVAS_HEIGHT - 50 - CANVAS_HEIGHT / 2 + 1)) +
                  CANVAS_HEIGHT / 2
        this.transition(this, this.x, newY)
        if (obj instanceof Ball) {
            this.transition(obj, this.x, newY)
        } else if (obj instanceof Star) {
            this.transition(obj, this.x, newY - 70)
            obj.setAlpha(1)
        }
        this.angle = 0
    }

    public reset() {
        this.angle = 0
    }
}
