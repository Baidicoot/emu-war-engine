import * as Common from "./common"

export interface AnimationKeyframes {
    spaces: number[]
    frames: string[]
}

export class AnimationHandle { //since objects are passed around by reference, this should work?
    private completed: boolean

    constructor() {
        this.completed = false
    }

    halt() {
        this.completed = true
    }

    get(): boolean {
        return this.completed
    }
}

// with the following we are going to run into mutex problems...
// hence, an animation handler is needed
const doAnimation = function rec(target: Common.RenderObject, frames: AnimationKeyframes, x: number, y: number, halt: AnimationHandle): AnimationHandle {
    if (frames.spaces.length > 0) {
        setTimeout(function() {
            if (!halt.get()) {
                target.setPixel(x, y, frames.frames[0])
                rec(target, {
                    spaces: Common.tail(frames.spaces),
                    frames: Common.tail(frames.frames),
                }, x, y, halt)
            } else {
                halt.halt()
            }
        }, frames.spaces[0])
    }

    return halt
}

export const spawnAnimation = function(target: Common.RenderObject, frames: AnimationKeyframes, x: number, y: number): AnimationHandle {
    return doAnimation(target, frames, x, y, new AnimationHandle())
}