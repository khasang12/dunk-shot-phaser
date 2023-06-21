import { IGameObject } from '../../types/object'
import GameObject from './GameObject'

export default class Star extends GameObject {
    constructor(o: IGameObject) {
        super(o)
    }
}
