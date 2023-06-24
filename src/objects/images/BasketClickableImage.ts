import { IClickableImage } from '../../types/image'
import ClickableImage from './ClickableImage'

export default class BasketClickableImage extends ClickableImage {
    constructor(i: IClickableImage) {
        super(i)
    }

    public onPointerDown() {
        this.setScale(this.scaleRatio * 0.9)
        this.callback()
    }
}
