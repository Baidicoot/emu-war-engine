import * as Common from "./common"
import * as Screen from "./screenstate"
import * as Animation from "./animation"
import * as Event from "./event"

export interface Player {
    x: number,
    y: number,
    hp: number,
    str: number,
    slots: Array<Spell | null>,
}

const playerEquip = function(p: Player, s: Spell | null, slot: number): Player {
    p.slots[slot] = s
    return p
}

export interface GameState {
    screen: Screen.ScreenState,
    player: Player,
    enemies: Array<Enemy>,
    inventory: Array<Spell>,
    animationQueue: Array<[Animation.AnimationKeyframes, number, number]>,
    sayQueue: Array<string>
}

const runAnimation = function(state: GameState, target: Common.RenderObject, animation: Animation.AnimationKeyframes, x: number, y: number): (GameState | null) {
    let handle: Animation.AnimationHandle = Animation.spawnAnimation(target, animation, x, y)
    state.screen = Screen.reserve(state.screen, handle, x, y)
    return state
}

const runAnimationQueue = function(state: GameState, target: Common.RenderObject): GameState {
    for (let i = 0; i < state.animationQueue.length; i++) {
        let animation: [Animation.AnimationKeyframes, number, number] = state.animationQueue[i]
        state = runAnimation(state, target, animation[0], animation[1], animation[2])
    }
    state.animationQueue = []
    return state
}

export const queueAnimation = function(state: GameState, animation: Animation.AnimationKeyframes, x: number, y: number): GameState {
    state.animationQueue.push([animation, x, y])
    return state
}

export const queueSpeech = function(state: GameState, str: string): GameState {
    state.sayQueue.push(str)
    return state
}

const runSayQueue = function(state: GameState, target: Common.SayObject): GameState {
    for (let i = 0; i < state.sayQueue.length; i++) {
        target.say(state.sayQueue[i])
    }
    state.sayQueue = []
    return state
}

const equip = function(state: GameState, index: number, slot: number): (GameState | null) {
    let selected: Spell = state.inventory[index]
    if (selected == null) return null
    if (selected.canEquip(slot)) {
        let replacing: Spell = state.player.slots[slot]
        state.player = playerEquip(state.player, selected, slot)
        state.inventory.splice(index, 1)
        if (replacing != null) {
            state.inventory.push(replacing)
            state = replacing.handleEvent({
                kind: Event.Action.Equip,
                slot: slot,
            } as Event.Equip, state)
        }
        state = selected.handleEvent({
            kind: Event.Action.UnEquip,
            slot: slot,
        } as Event.UnEquip, state)
    }
    return state
}

const unequip = function(state: GameState, slot: number): GameState {
    let selected = state.player.slots[slot]
    if (selected == null) return state
    state.inventory.push(selected)
    state.player.slots.splice(slot, 1)
    return state
}

const drop = function(state: GameState, index: number): GameState {
    state.inventory.splice(index, 1)
    return state
}

const use = function(state: GameState, cast: Event.Cast): GameState {
    return state.player.slots[cast.slot].handleEvent(cast, state)
}

export const hurtEnemy = function(state: GameState, index: number, pow: number): GameState {
    return state.enemies[index].handleEvent({
        kind: Event.Action.EnemyHurt,
        power: pow
    }, state)
}

export const playerDead = (state: GameState): boolean => state.player.hp <= 0

export const hurtPlayer = function(state: GameState, pow: number): GameState {
    state.player.hp -= pow
    if (state.player.hp <= 0) {
        for (let i = 0; i < state.player.slots.length; i++) {
            if (state.player.slots[i] != null) {
                state = state.player.slots[i].handleEvent({
                    kind: Event.Action.PlayerDie,
                }, state)
            }
        }

        for (let i = 0; i < state.enemies.length; i++) {
            state = state.enemies[i].handleEvent({
                kind: Event.Action.PlayerDie,
            }, state)
        }
    }

    return state
}

const moveAttack = function(state: GameState, move: Event.MoveAttack): GameState {
    let attack: boolean = false
    for (let i = 0; i < state.enemies.length; i++) {
        if (state.enemies[i].isHurtBy(move)) {
            attack = true
            state = hurtEnemy(state, i, state.player.str)
        }
    }

    if (!attack) {
        let pos = Event.movePointDirection(move.direction, state.player.x, state.player.y)
        state.player.x = pos[0]
        state.player.y = pos[1]

        for (let i = 0; i < state.enemies.length; i++) {
            state = state.enemies[i].handleEvent({
                kind: Event.Action.PlayerMove,
                direction: move.direction
            }, state)
        }
    }

    return state
}

export const handleInput = function(state: GameState, input: Event.Input): GameState {
    switch (input.kind) {
        case Event.Action.MoveAttack: {
            return moveAttack(state, input as Event.MoveAttack)
        }
        case Event.Action.Drop: {
            return drop(state, (input as Event.Drop).index)
        }
        case Event.Action.Equip: {
            let equipped = equip(state, (input as Event.Equip).index, (input as Event.Equip).slot)
            if (equipped != null) {
                return equipped
            } else {
                return state
            }
        }
        case Event.Action.UnEquip: {
            return unequip(state, (input as Event.UnEquip).slot)
        }
        case Event.Action.Cast: {
            return use(state, input as Event.Cast)
        }
    }
}

export const mainLoop = function(state: GameState, input: Event.Input, onDeath: (state: GameState) => void) {
    const turnEvent: Event.Event = {
        kind: Event.Action.Turn,
        playerx: state.player.x,
        playery: state.player.y
    }
    for (let i = 0; i < state.player.slots.length; i++) {
        if (state.player.slots[i] != null) {
            state = state.player.slots[i].handleEvent(turnEvent, state)
        }
    }
    for (let i = 0; i < state.enemies.length; i++) {
        state = state.enemies[i].handleEvent(turnEvent, state)
    }

    state = handleInput(state, input)

    if (state.player.hp <= 0) {
        onDeath(state)
    }

    return state
}

export const render = function(state: GameState, target: Common.RenderObject, speaker: Common.SayObject) {
    state = runAnimationQueue(state, target)
    state.screen.entities = [{x: state.player.x, y: state.player.y, value: '@'}]
    for (let i = 0; i < state.enemies.length; i++) {
        state.screen.entities = state.screen.entities.concat(state.enemies[i].draw())
    }
    Screen.cull(state.screen)
    Screen.draw(target, state.screen)
    return runSayQueue(state, speaker)
}

export interface Spell {
    canEquip: (slot: number) => boolean,
    draw: () => string,
    handleEvent: (event: Event.Event, gamestate: GameState) => GameState
}

export interface Enemy {
    draw: () => Array<Screen.Entity>,
    isHurtBy: (event: Event.MoveAttack) => boolean,
    handleEvent: (event: Event.Event, gamestate: GameState) => GameState,
}

const empty3DArray = <T>(w: number, h: number): Array<T> => {
    let o = []
    for (let x = 0; x < w; x++) {
        let tmp = []
        for (let y = 0; y < w; y++) {
            tmp.push(null)
        }
        o.push(tmp)
    }
    return o
}

export const Empty = (p1: Player, w: number, h: number, fill: string): GameState => ({
    screen: {
        width: w, height: h,
        animations: empty3DArray(w, h),
        entities: [],
        fill: fill,
    },
    player: p1,
    enemies: [],
    inventory: [],
    animationQueue: [],
    sayQueue: [],
})

export const spawnEnemy = (state: GameState, enemy: Enemy): GameState => {
    state.enemies.push(enemy)
    return state
}