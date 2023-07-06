import { IGameObject } from '../../../types/object'
import IObserver from '../../../types/observer'
import StaticBodyObject from '../StaticBodyObject'

export default class StaticBall extends StaticBodyObject implements IObserver {
    private isVibrating: boolean

    constructor(o: IGameObject) {
        super(o)
        this.scene.physics.add.existing(this)
        this.setOrigin(0.5, 0.5)
        this.setGravity(0, 0)
        this.body?.setCircle(this.width / 2 + 5)
        this.setScale(0.15)
        this.setImmovable(true)
        this.setPushable(false)
        this.scene.add.existing(this)
        this.setBounce(1, 1)
        this.isVibrating = false
    }

    public update(): void {
        this.setVelocity(0, 0)
    }

    public getIsVibrating(): boolean {
        return this.isVibrating
    }

    public onNotify(e: number): void {
        return
    }

    public vibrate(): void {
        this.isVibrating = true
        this.scene.tweens.add({
            targets: this,
            y: this.y - 10,
            duration: 20,
            ease: 'Linear',
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                this.isVibrating = false
            },
        })
    }
}
