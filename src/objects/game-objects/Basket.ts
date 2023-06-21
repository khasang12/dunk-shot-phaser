import { CANVAS_HEIGHT } from '../../constants'
import { IGameObject } from '../../types/object'
import { Point } from '../../types/point'
import Ball from './Ball'
import BodyObject from './BodyObject'

export default class Basket extends BodyObject {
    private trajectory: Point[]
    private points: Phaser.GameObjects.Graphics
    private dragStart: Point | null
    private callback: (x: number, y: number, a: number, b: number) => void
    private power: number
    private ang: number

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

        this.scene.add.existing(this)
    }

    public onPointerDown(pointer: Phaser.Input.Pointer) {
        this.dragStart = { x: pointer.x, y: pointer.y }
    }

    public onPointerUp(_pointer: Phaser.Input.Pointer) {
        this.setScale(this.scaleX, this.scaleX)
        if (this.power > 0) {
            this.callback(this.x, this.y, this.ang, this.power)
        }
    }

    public onPointerMove(pointer: Phaser.Input.Pointer) {
        // Check if the pointer is still down (i.e., the object is being dragged)
        if (pointer.isDown) {
            // Calculate the angle between the object's origin and the pointer position
            const angle = Phaser.Math.Angle.Between(this.x, this.y, pointer.x, pointer.y)

            // Set the object's rotation to the calculated angle
            this.rotation = angle + Math.PI / 2

            // If there's a drag start position, calculate the trajectory and draw it
            if (this.dragStart) {
                // Calculate the distance and angle between the starting position of the drag and the current pointer position
                const distance = Phaser.Math.Distance.Between(this.x, this.y, pointer.x, pointer.y)
                console.log('dist', distance)
                this.setTrajectory(Math.max(50, distance * 50), -angle)

                this.setScale(this.scaleX, Math.min(this.scaleY * 1.2, 0.8))

                this.power = distance
                this.ang = -angle
            }

            this.scene.time.delayedCall(500, () => {
                this.points.destroy()
            })
            this.dragStart = null
        }
    }

    public setTrajectory(power: number, angle: number) {
        this.trajectory = []
        // Create a new graphics object
        this.points = this.scene.add.graphics()
        // Set the fill color for the circles
        this.points.fillStyle(0xffa500, 1)
        for (let i = 0; i < 5; i++) {
            const timeSlice = i / 16.67
            const x = this.x + power * Math.cos(angle) * timeSlice
            const y = this.y - power * Math.sin(angle) * timeSlice + 0.5 * 9.8 * timeSlice ** 2
            this.trajectory.push({ x, y })
        }
        // Loop through each point in the trajectory and draw a circle at that position
        for (let i = 0; i < 5; i++) {
            const point = this.trajectory[i]
            this.points.fillCircle(point.x, point.y, 5)
        }
    }

    private transition(obj: Phaser.Physics.Arcade.Sprite, destY: number) {
        this.scene.tweens.add({
            targets: obj,
            x: this.x,
            y: destY,
            duration: 1000,
            ease: 'easeInOutExpo',
            onComplete: () => {
                console.log('Object move complete!')
            },
        })
    }

    public resetPosition(obj: Ball | null) {
        const newY =
            this.y > CANVAS_HEIGHT / 2
                ? Math.floor(Math.random() * (CANVAS_HEIGHT / 2 - 100 + 1)) + 100
                : Math.floor(Math.random() * (CANVAS_HEIGHT - 50 - CANVAS_HEIGHT / 2 + 1)) +
                    CANVAS_HEIGHT / 2
        this.transition(this, newY)
        if (obj) {
            this.transition(obj, newY)
        }
        this.angle = 0
    }

    public reset() {
        this.angle = 0
    }
}
