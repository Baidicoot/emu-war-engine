import * as Game from "./game"
import * as Event from "./event"


export const normalHurtMechanics = (x: number, y: number, event: Event.MoveAttack): boolean => {
    let pos = Event.movePointDirection(event.direction, event.x, event.y)
    return ((x - pos[0]) ** 2) + ((y - pos[1]) ** 2) <= 1
}

export type StateModifier<E> = (event: E, state: Game.GameState) => Game.GameState

const directionTowardsPlayer: (x: number, y: number, state: Game.GameState) => Event.Direction =
    (x: number, y: number, state: Game.GameState) => {
    let dx = state.player.x - x
    let dy = state.player.y - y

    if (Math.abs(dx) < Math.abs(dy)) {
        if (dy < 0) return Event.Direction.North
        else return Event.Direction.South
    } else {
        if (dx < 0) return Event.Direction.West
        else return Event.Direction.East
    }
}

export const meeleEnemyBehaviour = (hp: number, str: number, x: number, y: number, icon: string, onDie: StateModifier<Event.EnemyHurt>, onHit: StateModifier<Event.EnemyHurt>, onAttack: StateModifier<Event.Turn>): Game.Enemy => {
    return {
        draw: () => [{x: x, y: y, value: icon}],
        isHurtBy: (event) => normalHurtMechanics(x, y, event),
        handleEvent: (event, state) => {
            switch (event.kind) {
                case Event.Action.Turn: {
                    let dir = directionTowardsPlayer(x, y, state)
                    let newpos = Event.movePointDirection(dir, x, y)
                    if (newpos[0] == state.player.x && newpos[1] == state.player.y) {
                        state = onAttack(event as Event.Turn, state)
                    } else {
                        x = newpos[0]
                        y = newpos[1]
                    }
                }
                case Event.Action.EnemyHurt: {
                    state = onHit(event as Event.EnemyHurt, state)
                    if (hp <= 0) {
                        state = onDie(event as Event.EnemyHurt, state)
                    }
                }
            }
            return state
        }
    }
}