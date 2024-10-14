import { Option } from "../utils";

export const createUndoStack = ({ stack_size }: { stack_size: number }): UndoStack => {
    let stack: Cache[] = [];
    let sub_stack: Cache[] = [];
    const undo = (): Option<Cache> => {
        const res = stack.pop();
        if (res === undefined) return Option.None()
        sub_stack.push(res);
        return Option.Some(res);
    }
    const redo = (): Option<Cache> => {
        const res = sub_stack.pop();
        if (res === undefined) return Option.None()
        stack.push(res);
        return Option.Some(res);
    }
    const push = (c: Cache) => {
        stack.push(c);
        sub_stack = [];
        while (stack_size < stack.length) {
            stack.shift();
        }
    }
    const clear = () => {
        stack = [];
        sub_stack = [];
    }
    return {
        undo,
        redo,
        push,
        clear,
    }
}

export type UndoStack = {
    undo: () => Option<Cache>,
    redo: () => Option<Cache>,
    push: (c: Cache) => void,
    clear: () => void,
}

export type Cache = { i: number, u: CanvasPart, r: CanvasPart };

export class CanvasPart {
    x: number;
    y: number;
    // w: number;
    // h: number;
    area: HTMLCanvasElement;
    constructor(x: number, y: number, w: number, h: number, canvas: HTMLCanvasElement) {
        const area = document.createElement("canvas");
        area.width = w;
        area.height = h;
        const ctx = area.getContext("2d")!;
        ctx.drawImage(canvas, -x, -y);
        this.area = area;
        this.x = x;
        this.y = y;
        // this.w = w;
        // this.h = h;
    }
}

export const undo_stack = createUndoStack({ stack_size: 100 })