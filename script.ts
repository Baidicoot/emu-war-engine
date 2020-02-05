import * as Game from "./game"
import * as Render from "./render"
import * as Event from "./event"
import * as Animation from "./animation"
import * as Screen from "./screenstate"
import * as Common from "./common"

const consoleTarget: Common.RenderObject = {
    setPixel: (x: number, y: number, val: string) => {
        console.log(x + " " + y + " " + val)
    },
    getPixel: (x: number, y: number) => ""
}

const consoleSayBox: Common.SayObject = {
    say: (val: string) => {
        console.log("game says: " + val)
    }
}

const alertPlayerMove: Game.Enemy = {
    draw: () => [{x: 0, y: 0, value: "alertBot"}],
    isHurtBy: (event: Event.Event) => false,
    handleEvent: (event: Event.Event, state: Game.GameState) => {
        switch (event.kind) {
            case (Event.Action.PlayerMove): {
                state = Game.queueSpeech(state, "" + event.direction)
            }
            case (Event.Action.MoveAttack): {
                state = Game.queueSpeech(state, "" + event.direction)
            }
        }
        return state
    }
}

let game: Game.GameState = {
    screen: {
        width: 1,
        height: 1,
        animations: [[]],
        entities: [],
        fill: "."
    },
    player: {
        x: 0,
        y: 0,
        hp: 1,
        str: 0,
        slots: [null, null, null]
    },
    enemies: [alertPlayerMove],
    inventory: [],
    animationQueue: [],
    sayQueue: [],
}

game = Game.mainLoop(game, {kind: Event.Action.MoveAttack, direction: Event.Direction.South}, () => {})
Game.render(game, consoleTarget, consoleSayBox)