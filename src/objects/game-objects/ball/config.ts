export const flameParticleConfig = {
    frame: 'white',
    color: [0xfacc22, 0xf89800, 0xf83600, 0x9f0404],
    colorEase: 'quad.out',
    lifespan: 100,
    rotate: 90,
    scale: { start: 0.7, end: 0, ease: 'sine.out' },
    speed: 200,
    advance: 500,
    frequency: 60,
    blendMode: 'ADD',
    duration: 200,
}

export const smokeParticleConfig = {
    color: [0xe2224c, 0xe25822, 0xe2b822, 0x696969, 0xf5f5f5],
    alpha: { start: 0.9, end: 0.1, ease: 'sine.easeout' },
    angle: { min: 0, max: 360 },
    rotate: { min: 0, max: 360 },
    speed: { min: 40, max: 70 },
    colorEase: 'quad.easeinout',
    lifespan: 1500,
    scale: 0.5,
    frequency: 60,
}