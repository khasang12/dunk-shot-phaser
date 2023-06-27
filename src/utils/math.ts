import { Point } from '../types/point'

export function randomIntegerInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomAngle(): number {
    return Math.random() * Math.PI
}

export function getProjectX(length: number, angle: number): number {
    return length * Math.cos(angle)
}

export function getProjectY(length: number, angle: number): number {
    return length * Math.sin(angle)
}

export function getHypot(e1: number, e2: number): number {
    return Math.sqrt(e1 ** 2 + e2 ** 2)
}

export function getAngCoeff(x: number, y: number): number {
    return Math.atan2(y, x)
}

export function estimateVelocityAndAngle(center: Point, pointer: Phaser.Input.Pointer) {
    // calculate the angle between the bird and the pointer
    const angle = Phaser.Math.Angle.Between(center.x, center.y, pointer.x, pointer.y)

    // Calculate the distance and angle between the starting position of the drag and the current pointer position
    const distance = Phaser.Math.Distance.Between(center.x, center.y, pointer.x, pointer.y)

    return [distance, angle]
}
