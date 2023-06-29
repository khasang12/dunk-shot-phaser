import IObserver from '../types/observer'

export default class EventManager {
    private subscribers: Set<IObserver> = new Set()
    private static instance: EventManager

    public static getInstance(): EventManager {
        if (!EventManager.instance) {
            EventManager.instance = new EventManager()
        }
        return EventManager.instance
    }

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
