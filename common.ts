export const tail = function<T>(data: T[]): T[] {
    return data.slice(1)
}

export interface RenderObject {
    getPixel: (x: number, y: number) => string
    setPixel: (x: number, y: number, val: string) => void
}

export interface SayObject {
    say: (str: string) => void
}