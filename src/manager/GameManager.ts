import { InputManager } from './InputManager'
import SceneManager from './SceneManager'
import ScoreManager from './ScoreManager'
import SoundManager from './SoundManager'

export default class GameManager {
    private static instance: GameManager
    private sceneManager: SceneManager
    public scoreManager: ScoreManager
    public inputManager: InputManager
    public soundManager: SoundManager

    private constructor() {
        this.sceneManager = SceneManager.getInstance()
        this.scoreManager = ScoreManager.getInstance()
        this.inputManager = InputManager.getInstance()
        this.soundManager = SoundManager.getInstance()
    }

    public static getInstance(): GameManager {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager()
        }
        return GameManager.instance
    }

    public getScoreManager() {
        return this.scoreManager
    }

    public getSceneManager() {
        return this.sceneManager
    }

    public getInputManager() {
        return this.inputManager
    }
}
