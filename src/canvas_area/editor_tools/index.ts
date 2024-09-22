import { canvas_tools } from "..";
import { State } from "../../common/utils";
import { Layer } from "../../data";
import { brush_tools } from "./brush_tool";
import { eraser_tools } from "./eraser_tool";
import { line_tools } from "./line_tool";
import { rect_tools } from "./rect_tool";

export type toolT = {
    "down"?: (x: number, y: number) => void,
    "up"?: (x: number, y: number, was_down: boolean) => void,
    "move"?: (x: number, y: number) => void,
    "tool_move"?: (x: number, y: number) => void,

};

export type argsT = {
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
    brush_color: State<string>,
    brush_thickness: State<number>,
    eraser_thickness: State<number>,
    layers_arr: State<Layer[] | undefined>,
    current_layer: State<number>,
};

export const editor_tools = ({
    canvas,
    ctx,
    brush_color,
    brush_thickness,
    eraser_thickness,
    layers_arr,
    current_layer
}: argsT): { [key in typeof canvas_tools[number]]: toolT } => {
    const packed = {
        canvas,
        ctx,
        brush_color,
        brush_thickness,
        eraser_thickness,
        layers_arr,
        current_layer
    };
    return {
        "none": (() => {
            return {
                "move": (x, y) => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = "#fff4";
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        })(),
        "brush_tool": brush_tools(packed),
        "line_tool": line_tools(packed),
        "eraser_tool": eraser_tools(packed),
        "bucket_tool": {},
        "select_tool": {},
        "rect_tool": rect_tools(packed),
        "circle_tool": {},
    }
};

export const bresenham = (f: (x: number, y: number) => void, x1: number, y1: number, x2: number, y2: number) => {
    const points: Array<[number, number]> = [];

    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = (x1 < x2) ? 1 : -1;
    const sy = (y1 < y2) ? 1 : -1;
    let err = dx - dy;

    while (true) {
        f(x1, y1);
        points.push([x1, y1]);

        if (x1 === x2 && y1 === y2) break;

        const e2 = err * 2;

        if (e2 > -dy) {
            err -= dy;
            x1 += sx;
        }

        if (e2 < dx) {
            err += dx;
            y1 += sy;
        }
    }

    return points;
}