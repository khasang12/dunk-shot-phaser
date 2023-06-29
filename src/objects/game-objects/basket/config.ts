export const BASKET_TWEENS_MOVING = {
    duration: 1000, // Duration of the animation in milliseconds
    ease: 'Power1',
    yoyo: true, // Make the tween repeat back and forth
    repeat: -1, // Repeat the tween indefinitely
}

export const BASKET_TWEENS_ROTATING = {
    angle: Phaser.Math.Between(-45, 45),
    duration: 1000, // Duration of the animation in milliseconds
    ease: 'Linear',
    yoyo: true, // Make the tween repeat back and forth
    repeat: -1, // Repeat the tween indefinitely
}

export const BASKET_TWEENS_VIBRATING = {
    duration: 20,
    ease: 'Linear',
    yoyo: true,
    repeat: 3,
}
