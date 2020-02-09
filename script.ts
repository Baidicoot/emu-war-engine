import * as Game from "./game"
import * as Render from "./render"
import * as Event from "./event"
import * as Animation from "./animation"
import * as Screen from "./screenstate"
import * as Common from "./common"
import * as Entity from "./entities"

const W: number = 64
const H: number = 32

const target = document.getElementById("target")
const screen: Render.RenderTarget = Render.RenderTarget(W, H, " ")
target.appendChild(screen.view)

const screenTarget: Common.RenderObject = {
    setPixel: Render.setPixel(screen),
    getPixel: Render.getPixel(screen),
}

const speechbox: Render.SpeechTarget = Render.SpeechBox()

const sayTarget: Common.SayObject = {
    say: Render.say(speechbox)
}

let gamestate: Game.GameState = Game.Empty({
    x: 32, y: 16,
    hp: 100,
    str: 10,
    slots: [null, null, null],
}, W, H, " ")

const snd = (a, b) => b
const voidfn = x => {}

gamestate = Game.spawnEnemy(gamestate, Entity.meeleEnemyBehaviour(
    20,
    10,
    10,
    10,
    "E",
    snd,
    snd,
    snd,
))

setInterval(() => {
    gamestate = Game.mainLoop(gamestate, {
        kind: Event.Action.Drop,
        index: 0
    }, voidfn)
    gamestate = Game.render(gamestate, screenTarget, sayTarget)
}, 500)
