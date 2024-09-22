import { useEffect, useRef, useState } from "react"
import { atom, useRecoilState, useRecoilValue } from "recoil";
import { selected_tool_id_state } from "../tool_select";
import { canvas_tools } from ".";
import { current_layer_state, layer_arr_state } from "../app";
import { brush_tool_color_state, brush_tool_thickness_state, eraser_tool_thickness_state } from "../tool_menu"
import { State } from "../common/utils";
import { editor_tools } from "./editor_tools";

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
    const layers_arr = new State(useRecoilState(layer_arr_state));
    const current_layer = new State(useRecoilState(current_layer_state));

    const set_mouse_down = (b: ((currVal: boolean) => boolean) | boolean) => {
        const v = typeof b === "function" ? b(is_mouse_down) : b;
        set_mouse_down_raw(v);
        is_mouse_down = v;
    }

    const div_ref = useRef<HTMLDivElement>(null);
    const canvas_ref = useRef<HTMLCanvasElement>(null);

    const selected_tool_id = useRecoilValue(selected_tool_id_state);
    const selected_tool = useRef<typeof canvas_tools[number]>("none");
    const brush_color = new State(useRecoilState(brush_tool_color_state));
    const brush_thickness = new State(useRecoilState(brush_tool_thickness_state));
    const eraser_thickness = new State(useRecoilState(eraser_tool_thickness_state));

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
        const fn_data = editor_tools({
            canvas,
            ctx,
            brush_color,
            brush_thickness,
            eraser_thickness,
            layers_arr,
            current_layer
        });
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

