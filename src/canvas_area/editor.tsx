import { useEffect, useRef, useState } from "react"
import { atom, useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { selected_tool_id_state } from "../tool_select";
import { canvas_tools } from ".";
import { current_layer_state, layer_arr_state } from "../App";
import { Layer } from "../data";
import { brush_tool_color_state } from "../tool_menu/brush_tool/color_picker";

type canvas_editor_propsT = {
    canvas_width: number,
    canvas_height: number,
    zoom: number,
    area_width: number,
    area_height: number,
    scroll_horizontal: number,
    scroll_vertical: number,
}

export const is_mouse_down_in_editor_state = atom({
    key: "is_mouse_down_in_editor_state",
    default: false,
})

export const CanvasEditor = ({
    canvas_width,
    canvas_height,
    zoom: z,
    area_width,
    area_height,
    scroll_horizontal,
    scroll_vertical,
}: canvas_editor_propsT) => {
    let [once, set_once] = useState(true);
    let [is_mouse_down, set_mouse_down_raw] = useRecoilState(is_mouse_down_in_editor_state);
    const [_layers_arr, set_layers_arr] = useRecoilState(layer_arr_state);
    const current_layer = useRecoilValue(current_layer_state);

    const set_mouse_down = (b: ((currVal: boolean) => boolean) | boolean) => {
        const v = typeof b === "function" ? b(is_mouse_down) : b;
        set_mouse_down_raw(v);
        is_mouse_down = v;
    }

    const div_ref = useRef<HTMLDivElement>(null);
    const canvas_ref = useRef<HTMLCanvasElement>(null);

    const selected_tool_id = useRecoilValue(selected_tool_id_state);
    const selected_tool = useRef<typeof canvas_tools[number]>("none");
    const set_brush_color = useSetRecoilState(brush_tool_color_state);

    const zoom = useRef(z);
    useEffect(() => { zoom.current = z }, [z]);
    useEffect(() => {
        selected_tool.current = canvas_tools[selected_tool_id + 1];
    }, [selected_tool_id]);
    useEffect(() => {
        const canvas = canvas_ref.current;
        if (!canvas) return;
        canvas.width = canvas_width;
        canvas.height = canvas_height;
    }, [canvas_width, canvas_height])
    useEffect(() => {
        const div = div_ref.current;
        const canvas = canvas_ref.current;
        if (!div || !canvas) return;
        if (!once) return;
        canvas.width = canvas_width;
        canvas.height = canvas_height;
        const ctx = canvas.getContext("2d")!;
        set_once(false);
        once = false;
        const fn_data: {
            [key in typeof canvas_tools[number]]: {
                "down"?: (x: number, y: number) => void,
                "up"?: (x: number, y: number, was_down: boolean) => void,
                "move"?: (x: number, y: number) => void,
                "tool_move"?: (x: number, y: number) => void,
            }
        } = {
            "none": (() => {
                return {
                    "move": (x, y) => {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.fillStyle = "#fff4";
                        ctx.fillRect(x, y, 1, 1);
                    }
                }
            })(),
            "brush_tool": (() => {
                let b_x = 0;
                let b_y = 0;
                return {
                    "down": (x, y) => {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.fillStyle = "#f00";
                        let color = "#fff";
                        set_brush_color(_ => { color = _; return _; })
                        ctx.fillStyle = color;
                        ctx.fillRect(x, y, 1, 1);
                        b_x = x;
                        b_y = y;
                    },
                    "tool_move": (x, y) => {
                        bresenham((x, y) => {
                            let color = "#fff";
                            set_brush_color(_ => { color = _; return _; })
                            ctx.fillStyle = color;
                            ctx.fillRect(x, y, 1, 1);
                        }, b_x, b_y, x, y);
                        b_x = x;
                        b_y = y;
                    },
                    "up": (_x, _y, was_down) => {
                        if (!was_down) return;
                        let layers: Layer[] = [];
                        set_layers_arr(_ => { layers = _!; return _; })
                        const layer = layers[current_layer];
                        layer.ctx.drawImage(canvas, 0, 0);
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        layer.preview_update();
                        set_layers_arr([...layers!]);
                    },
                    "move": (x, y) => {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.fillStyle = "#fff4";
                        ctx.fillRect(x, y, 1, 1);
                    },
                }
            })(),
            "eraser_tool": (() => {
                let b_x = 0;
                let b_y = 0;
                return {
                    "down": (x, y) => {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        let layers: Layer[] = [];
                        set_layers_arr(_ => { layers = _!; return _; })
                        const layer = layers[current_layer];
                        layer.ctx.clearRect(x, y, 1, 1);
                        b_x = x;
                        b_y = y;
                    },
                    "tool_move": (x, y) => {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        let layers: Layer[] = [];
                        set_layers_arr(_ => { layers = _!; return _; })
                        const layer = layers[current_layer];
                        bresenham((x, y) => {
                            layer.ctx.clearRect(x, y, 1, 1);
                        }, b_x, b_y, x, y);
                        b_x = x;
                        b_y = y;
                    },
                    "up": (_x, _y) => {
                        let layers: Layer[] = [];
                        set_layers_arr(_ => { layers = _!; return _; })
                        const layer = layers[current_layer];
                        layer.preview_update();
                        set_layers_arr([...layers!]);
                    },
                    "move": (x, y) => {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.fillStyle = "#fff4";
                        ctx.fillRect(x, y, 1, 1);
                    },
                }
            })(),
        };
        document.addEventListener("mousemove", e => {
            if (!is_mouse_down) return;
            const canvas_rect = canvas.getBoundingClientRect();
            const [x, y] = [Math.floor((e.clientX - canvas_rect.left) / zoom.current), Math.floor((e.clientY - canvas_rect.top) / zoom.current)];

            const fn = fn_data[selected_tool.current];
            if (fn.tool_move) fn.tool_move(x, y);
            else if (fn.move) fn.move(x, y);
        });
        div.addEventListener("mousemove", e => {
            if (is_mouse_down) return;
            const canvas_rect = canvas.getBoundingClientRect();
            const [x, y] = [Math.floor((e.clientX - canvas_rect.left) / zoom.current), Math.floor((e.clientY - canvas_rect.top) / zoom.current)];

            const fn = fn_data[selected_tool.current];
            if (fn.move) fn.move(x, y);
        });
        div.addEventListener("mousedown", e => {
            const canvas_rect = canvas.getBoundingClientRect();
            const [x, y] = [Math.floor((e.clientX - canvas_rect.left) / zoom.current), Math.floor((e.clientY - canvas_rect.top) / zoom.current)];

            const fn = fn_data[selected_tool.current];
            if (fn.down) fn.down(x, y);
            set_mouse_down(true);
        });
        document.addEventListener("mouseup", e => {
            const canvas_rect = canvas.getBoundingClientRect();
            const [x, y] = [Math.floor((e.clientX - canvas_rect.left) / zoom.current), Math.floor((e.clientY - canvas_rect.top) / zoom.current)];

            const fn = fn_data[selected_tool.current];
            if (fn.up) fn.up(x, y, is_mouse_down);
            set_mouse_down(false);
        });
    }, []);
    return (
        <div ref={div_ref} style={{
            position: "absolute",
            margin: 0,
            width: "100%",
            height: "100%",
            userSelect: "none",
        }}>
            <canvas ref={canvas_ref}
                style={{
                    position: "absolute",
                    left: (-0.5 * canvas_width * z) + (0.5 * area_width) - (scroll_horizontal * canvas_width * z),
                    top: (-0.5 * canvas_height * z) + (0.5 * area_height) - (scroll_vertical * canvas_height * z),
                    width: canvas_width * z,
                    height: canvas_height * z,
                    imageRendering: "pixelated",
                    userSelect: "none",
                }} />
        </div>
    )
}

const bresenham = (f: (x: number, y: number) => void, x1: number, y1: number, x2: number, y2: number) => {
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