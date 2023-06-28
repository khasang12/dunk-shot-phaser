import IObserver from '../types/observer'

export default class EventManager {
    private subscribers: Set<IObserver> = new Set()

    public subscribe(subscriber: IObserver) {
        this.subscribers.add(subscriber)
    }

    public unsubscribe(subscriber: IObserver) {
        this.subscribers.delete(subscriber)
    }

    public notify(event: number) {
        for (const subscriber of this.subscribers) {
            subscriber.onNotify(event)
        }
    }
}
