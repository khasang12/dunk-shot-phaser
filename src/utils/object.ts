export function deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj))
}

export function swap<T>(a: T, b: T): [T, T] {
    return [b, a]
}
