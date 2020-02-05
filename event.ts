export enum Direction {
    North,
    South,
    East,
    West,
}

export enum Action {
    MoveAttack,
    Cast,
    Drop,
    Equip,
    UnEquip,
    EnemyHurt,
    PlayerHurt,
    PlayerMove,
    PlayerDie,
    Turn,
}

export interface Turn {
    kind: Action.Turn,
    playerx: number,
    playery: number,
}

export interface MoveAttack {
    kind: Action.MoveAttack,
    direction: Direction,
}

export interface Cast {
    kind: Action.Cast,
    slot: number | null,
    direction: Direction,
}

export interface Drop {
    kind: Action.Drop,
    index: number,
}

export interface Equip {
    kind: Action.Equip,
    slot: number,
    index: number,
}

export interface UnEquip {
    kind: Action.UnEquip,
    slot: number,
}

export interface EnemyHurt {
    kind: Action.EnemyHurt,
    power: number
}

export interface PlayerHurt {
    kind: Action.PlayerHurt,
    enemy: number,
    power: number
}

export interface PlayerMove {
    kind: Action.PlayerMove,
    direction: Direction
}

export interface PlayerDie {
    kind: Action.PlayerDie,
}

export type Event = MoveAttack | Cast | Drop | Equip | UnEquip | EnemyHurt | PlayerHurt | PlayerMove | PlayerDie | Turn
export type Input = MoveAttack | Cast | Drop | Equip | UnEquip

export const movePointDirection = function(dir: Direction, x: number, y: number): [number, number] {
    switch (dir) {
        case Direction.North: return [x, y-1]
        case Direction.South: return [x, y+1]
        case Direction.West: return [x-1, y]
        case Direction.East: return [x+1, y]
    }
}