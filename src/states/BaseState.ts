import StateMachine from './StateMachine'

export default abstract class BaseState {
    public stateMachine: StateMachine
    public abstract enter(scene: Phaser.Scene, obj: Phaser.Physics.Arcade.Sprite): void
    public abstract execute(scene: Phaser.Scene, obj: Phaser.Physics.Arcade.Sprite): void
}
