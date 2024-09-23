import { canvas_toolsT } from "..";
import { State } from "../../common/utils";
import { Layer } from "../../data";
import { brush_tool } from "./brush_tool";
import { bucket_tool } from "./bucket_tool";
import { eraser_tool } from "./eraser_tool";
import { line_tool } from "./line_tool";
import { rect_tool } from "./rect_tool";
import { select_tool } from "./select_tool";

export type toolT = {
    "down"?: (args: { x: number, y: number, shift: boolean, ctrl: boolean }) => void,
    "up"?: (args: { x: number, y: number, shift: boolean, ctrl: boolean, was_down: boolean }) => void,
    "move"?: (args: { x: number, y: number, shift: boolean, ctrl: boolean }) => void,
    "tool_move"?: (args: { x: number, y: number, shift: boolean, ctrl: boolean }) => void,
    "on_end"?: () => void,
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
}: argsT): { [key in canvas_toolsT]: toolT } => {
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
                "move": ({ x, y }) => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = "#fff4";
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        })(),
        "brush_tool": brush_tool(packed),
        "line_tool": line_tool(packed),
        "eraser_tool": eraser_tool(packed),
        "bucket_tool": bucket_tool(packed),
        "text_tool": {},
        "select_tool": select_tool(packed),
        "rect_tool": rect_tool(packed),
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