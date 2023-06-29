import { Point } from '../types/point'
import { estimateVelocityAndAngle } from '../utils/math'

export class InputManager {
    private static instance: InputManager
    private dragStart: Point | null

    public static getInstance(): InputManager {
        if (!InputManager.instance) {
            InputManager.instance = new InputManager()
        }
        return InputManager.instance
    }

    public onPointerDown(pointer: Phaser.Input.Pointer): void {
        this.dragStart = { x: pointer.x, y: pointer.y }
    }

    public isDragging(): boolean {
        return this.dragStart != null
    }

    public emitDragLeave(): void {
        this.dragStart = null
    }

    public estimateVelocityAndAngle(pointer: Phaser.Input.Pointer): number[] {
        if (this.dragStart) return estimateVelocityAndAngle(this.dragStart, pointer)
        return [0, 0]
    }
}
