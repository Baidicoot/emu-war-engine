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