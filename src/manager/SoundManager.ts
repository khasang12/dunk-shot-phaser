import { Sound } from '../types/sound'

export default class SoundManager {
    private static instance: SoundManager
    private soundList: Map<string, Sound>

    private constructor(){
        this.soundList = new Map<string, Sound>()
    }

    public static getInstance(): SoundManager {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager()
        }
        return SoundManager.instance
    }

    public addSound(key: string, sound: Sound) {
        this.soundList.set(key, sound)
    }

    public getSound(key: string): Sound | null {
        if (this.soundList.has(key)) this.soundList.get(key)
        return null
    }

    public playSound(key: string): void {
        if (this.soundList.has(key)) this.soundList.get(key)?.play()
    }
}
