export default class ScoreManager {
    private static instance: ScoreManager
    private curScore: number
    private bestScore: number
    private stars: number
    private curStar: number

    private constructor() {
        this.curScore = 0
        this.curStar = 0

        if (!localStorage.getItem('star')) {
            localStorage.setItem('star', '0')
            this.stars = 0
        } else {
            this.stars = parseInt(<string>localStorage.getItem('star'))
        }

        if (!localStorage.getItem('high-score')) {
            localStorage.setItem('high-score', '0')
            this.bestScore = 0
        } else {
            this.bestScore = parseInt(<string>localStorage.getItem('high-score'))
        }
    }

    public static getInstance(): ScoreManager {
        if (!ScoreManager.instance) {
            ScoreManager.instance = new ScoreManager()
        }
        return ScoreManager.instance
    }

    public reset(): void {
        this.curScore = 0
        this.curStar = 0
    }

    public getCurScore(): number {
        return this.curScore
    }

    public getBestScore(): number {
        return this.bestScore
    }

    public getCurStar(): number {
        return this.curStar
    }

    public getStars(): number {
        return this.stars
    }

    public incrementScore(bonus: number): void {
        this.curScore += bonus
    }

    public incrementStar(): void {
        this.curStar++
    }

    public saveScoreToLocalStorage(): void {
        this.bestScore = Math.max(this.bestScore, this.curScore)
        this.stars += this.curStar
        localStorage.setItem('high-score', this.bestScore.toString())
        localStorage.setItem('star', this.stars.toString())
    }
}
