export interface RenderTarget {
    readonly view: HTMLTableSectionElement
}

export const genTable = function(x: number, y: number, fill: string): HTMLTableSectionElement {
    let tbody = document.createElement("tbody")

    for (let row = 0; row < y; row++) {
        let tr = document.createElement("tr")
        for (let col = 0; col < x; col++) {
            let th = document.createElement("th")
            th.innerHTML = fill
            tr.appendChild(th)
        }
        tbody.appendChild(tr)
    }

    return tbody
}

export const RenderTarget = function(x: number, y: number, fill: string): RenderTarget {
    return {
        view: genTable(x, y, fill)
    }
}

export const setPixel = (target: RenderTarget) => (x: number, y: number, val: string): void => {
    target.view.childNodes[y].childNodes[x].childNodes[0].nodeValue = val
}

export const getPixel = (target: RenderTarget) => (x: number, y: number): string =>
    target.view.childNodes[y].childNodes[x].nodeValue

export interface SpeechTarget {
    readonly elem: HTMLParagraphElement
}

export const genBox = (): HTMLParagraphElement => {
    return document.createElement("p")
}

export const SpeechBox = (): SpeechTarget => {
    return {
        elem: genBox()
    }
}

export const say = (target: SpeechTarget) => (val: string): void => {
    target.elem.nodeValue += val
}

export const clear = (target: SpeechTarget) => {
    target.elem.nodeValue = ""
}