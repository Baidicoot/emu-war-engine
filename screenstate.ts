import * as Common from "./common"
import * as Animation from "./animation"

export interface Entity {
    x: number,
    y: number,
    value: string,
}

export interface ScreenState {
    width: number,
    height: number,
    animations: (Animation.AnimationHandle | null)[][],
    entities: Entity[],
    fill: string,
}

export const reserve = function(state: ScreenState, animation: Animation.AnimationHandle, x: number, y: number): ScreenState {
    if(state.animations[x][y] != null) {
        state.animations[x][y].halt()
    }
    state.animations[x][y] = animation
    return state
}

export const draw = function(target: Common.RenderObject, state: ScreenState) {
    for (let x = 0; x < state.width; x++) {
        for (let y = 0; y < state.height; y++) {
            if (state.animations[x][y] == null) {
                target.setPixel(x, y, state.fill)
            }
        }
    }

    for (let i = 0; i < state.entities.length; i++) {
        let x: number = state.entities[i].x
        let y: number = state.entities[i].y
        if(state.animations[x][y] == null) {
            target.setPixel(x, y, state.entities[i].value)
        }
    }
}

export const cull = function(state: ScreenState) { //cull completed animations
    for (let x = 0; x < state.width; x++) {
        for (let y = 0; y < state.height; y++) {
            if (state.animations[x][y] != null) {
                let handle: Animation.AnimationHandle = state.animations[x][y]
                if (handle.get()) {
                    state.animations[x][y] = null
                }
            }
        }
    }
}