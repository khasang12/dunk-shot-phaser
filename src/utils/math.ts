import { SPEED_LIMIT } from '../constants'
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

export function drawParabolaTrajectory(
    points: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    speed: number,
    radian: number,
    minWidth: number,
    maxWidth: number
): void {
    const trajectory = []
    for (let i = 0; i < 6; i++) {
        const time = i * 0.2
        let dx = x + getProjectX(Math.min(SPEED_LIMIT, speed) * 7.5, radian) * time
        const dy =
            y -
            getProjectY(Math.min(SPEED_LIMIT, speed) * 7.5, radian) * time +
            0.5 * 980 * time ** 2
        if (dx < minWidth) dx = -dx // symmetric
        else if (dx > maxWidth) dx = maxWidth - (dx - maxWidth)
        trajectory.push({ x: dx, y: dy })
    }

    // Loop through each point in the trajectory and draw a circle at that position
    for (let i = 0; i < 6; i++) {
        const point = trajectory[i]
        points.fillCircle(point.x, point.y, 12 - i)
    }
}
