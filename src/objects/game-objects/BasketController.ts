import { BASKET_EFFECTS, COLLISION_EVENTS } from '../../constants'
import { gameManager } from '../../game'
import IObserver from '../../types/observer'
import Basket from './Basket'

export default class BasketController implements IObserver {
    private curBasket: Basket
    private nextBasket: Basket

    public setCur(b: Basket) {
        this.curBasket = b
    }
    public setNext(b: Basket) {
        this.nextBasket = b
    }
    public getCur() {
        return this.curBasket
    }
    public getNext() {
        return this.nextBasket
    }

    public swap() {
        const temp = this.curBasket
        this.curBasket = this.nextBasket
        this.nextBasket = temp
        this.curBasket.rotation = 0
    }
    public onNotify(e: number): void {
        const curScore = gameManager.getScoreManager().getCurScore()
        switch (e) {
            case COLLISION_EVENTS['CURRENT_BASKET']:
                this.curBasket.reset()
                break
            case COLLISION_EVENTS['OBSTACLE']:
                this.nextBasket.vibrateX()
                break
            case COLLISION_EVENTS['NEXT_BASKET']:
                if (curScore >= 15)
                    this.getCur().stateMachine.setState('transit', 1, BASKET_EFFECTS['ROTATE'])
                else if (curScore >= 10)
                    this.getCur().stateMachine.setState('transit', 1, BASKET_EFFECTS['MOVE_X'])
                else if (curScore >= 5)
                    this.getCur().stateMachine.setState('transit', 1, BASKET_EFFECTS['MOVE_Y'])
                else this.getCur().stateMachine.setState('transit', 1)

                this.getNext().stateMachine.setState('transit', 0)
                this.swap()
        }
    }
}
