import { canvas_toolsT } from "../../../render/canvas_area";
import { Layer } from "../../common/data";
import { FileStateT } from "../../file";
import { State } from "../../common/utils";
import { Cache, UndoStack } from "../undo";
import { brush_tool } from "./brush_tool";
import { bucket_tool } from "./bucket_tool";
import { eraser_tool } from "./eraser_tool";
import { line_tool } from "./line_tool";
import { rect_tool } from "./rect_tool";
import { select_tool } from "./select_tool";
import { stamp_tool } from "./stamp_tool";

export type toolT = {
    "down"?: (args: { x: number, y: number, f_x: number, f_y: number, zoom: number, shift: boolean, ctrl: boolean }) => void,
    "up"?: (args: { x: number, y: number, f_x: number, f_y: number, zoom: number, shift: boolean, ctrl: boolean, was_down: boolean }) => void,
    "move"?: (args: { x: number, y: number, f_x: number, f_y: number, zoom: number, shift: boolean, ctrl: boolean }) => void,
    "tool_move"?: (args: { x: number, y: number, f_x: number, f_y: number, zoom: number, shift: boolean, ctrl: boolean }) => void,
    "on_end"?: (args: { new_tool: string }) => void,
    "on_start"?: (args: { old_tool: string }) => void,
    "on_canvas_change"?: (args: {}) => void,
    "on_ctrl_a"?: (args: {}) => void,
    "on_ctrl_c"?: (args: {}) => void,
    "on_ctrl_v"?: (args: {}) => void,
    "on_ctrl_x"?: (args: {}) => void,
    "on_ctrl_y"?: (args: {}) => boolean,
    "on_ctrl_z"?: (args: {}) => boolean,
    "on_arrow_down"?: (args: { kind: "up" | "down" | "right" | "left" }) => void,
    "on_arrow_up"?: (args: { kind: "up" | "down" | "right" | "left" }) => void,
};

export type argsT = {
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
    brush_color: State<string>,
    brush_thickness: State<number>,
    eraser_thickness: State<number>,
    layers_arr: State<Layer[] | undefined>,
    current_layer: State<number>,
    undo_stack: UndoStack,
    file_state: State<FileStateT>,
    need_on_end: State<boolean>,
};

export type toolsT = { [key in canvas_toolsT]: toolT }


export const editor_tools = ({
    canvas,
    ctx,
    brush_color,
    brush_thickness,
    eraser_thickness,
    layers_arr,
    current_layer,
    undo_stack,
    file_state,
    need_on_end
}: argsT): [toolsT, () => void] => {
    const packed = {
        canvas,
        ctx,
        brush_color,
        brush_thickness,
        eraser_thickness,
        layers_arr,
        current_layer,
        undo_stack,
        file_state,
        need_on_end,
    };
    const cleanups: (() => void)[] = [];
    return [{
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
        "stamp_tool": stamp_tool(packed),
        "select_tool": select_tool(packed, cleanups),
        "rect_tool": rect_tool(packed),
    }, () => {
        cleanups.forEach(c => c());
    }]
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