export type IBodyGroup = {
    world: Phaser.Physics.Arcade.World
    scene: Phaser.Scene
    config:
        | Phaser.Types.Physics.Arcade.PhysicsGroupConfig
        | Phaser.Types.GameObjects.Group.GroupCreateConfig
}
