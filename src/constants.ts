export const CANVAS_WIDTH = 720
export const CANVAS_HEIGHT = 1080
export const LIGHT_BG = 'rgb(240, 240, 240)'
export const DARK_BG = 'rgb(20, 24, 82)'

export const SCENE_KEYS: Readonly<{ [key: string]: string }> = {
    CUSTOM: 'CustomizeScene',
    OVER: 'GameOverScene',
    PAUSE: 'PauseScene',
    PLAY: 'PlayScene',
    LOAD: 'PreloadScene',
    START: 'StartScene',
    SETTING: 'SettingScene',
}

export const BASKET_EFFECTS: Readonly<{ [key: string]: number }> = {
    NONE: -1,
    ROTATE: 1,
    MOVE_X: 2,
    MOVE_Y: 3,
}

export const COLLISION_EVENTS: Readonly<{ [key: string]: number }> = {
    LOWER_BOUND: 1,
    OBSTACLE: 2,
    CURRENT_BASKET: 3,
    NEXT_BASKET: 4,
}

export const SPEED_LIMIT = 180
