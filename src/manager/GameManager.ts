import SceneManager from './SceneManager'
import ScoreManager from './ScoreManager'

export default class GameManager {
    private static instance: GameManager
    private sceneManager: SceneManager
    public scoreManager: ScoreManager
    private constructor() {
        this.sceneManager = SceneManager.getInstance()
        this.scoreManager = ScoreManager.getInstance()
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
}
