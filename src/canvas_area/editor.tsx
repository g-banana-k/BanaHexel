import { useEffect, useRef, useState } from "react"
import { atom, useRecoilState, useRecoilValue } from "recoil";
import { selected_tool_id_state } from "../tool_select";
import { canvas_toolsT } from ".";
import { current_layer_state, layer_arr_state } from "../app";
import { brush_tool_color_state, brush_tool_thickness_state, eraser_tool_thickness_state } from "../tool_menu"
import { Option, State } from "../common/utils";
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

    const [selected_tool_id, set_selected_tool_id] = useRecoilState(selected_tool_id_state);
    const selected_tool = useRef<canvas_toolsT>("none");
    const brush_color = new State(useRecoilState(brush_tool_color_state));
    const brush_thickness = new State(useRecoilState(brush_tool_thickness_state));
    const eraser_thickness = new State(useRecoilState(eraser_tool_thickness_state));

    const zoom = useRef(z);
    const fn_data = new State(useState(Option.None<ReturnType<typeof editor_tools>>()));

    useEffect(() => { zoom.current = z }, [z]);

    useEffect(() => {
        const b_tool = selected_tool.current;
        const n_tool = selected_tool_id;
        selected_tool.current = selected_tool_id;
        fn_data.val_local().on_some(fn_data => {
            const on_end = fn_data[b_tool].on_end;
            const on_start = fn_data[n_tool].on_start;
            if (on_end) on_end({ new_tool: n_tool });
            if (on_start) on_start({ old_tool: b_tool });
        })
    }, [selected_tool_id]);

    useEffect(() => {
        fn_data.val_local().on_some(fn_data => {
            const on_canvas_change = fn_data[selected_tool_id].on_canvas_change;
            if (on_canvas_change) on_canvas_change({});
        })
    }, [layers_arr.val_global()![current_layer.val_global()].uuid])

    useEffect(() => {
        const canvas = canvas_ref.current;
        if (!canvas) return;
        canvas.width = canvas_width;
        canvas.height = canvas_height;
    }, [canvas_width, canvas_height]);

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
        fn_data.set(Option.Some(editor_tools({
            canvas,
            ctx,
            brush_color,
            brush_thickness,
            eraser_thickness,
            layers_arr,
            current_layer
        })));
        document.addEventListener("mousemove", e => {
            const canvas_rect = canvas.getBoundingClientRect();
            const [x, y] = [Math.floor((e.clientX - canvas_rect.left) / zoom.current), Math.floor((e.clientY - canvas_rect.top) / zoom.current)];
            const packed = { x, y, ctrl: e.ctrlKey, shift: e.shiftKey, }
            const fn = fn_data.val_local().unwrap()[selected_tool.current];
            if (is_mouse_down) {
                if (fn.tool_move) fn.tool_move(packed);
            } else if (div.contains(e.target as Node | null)) {
                if (fn.move) fn.move(packed);
            }
        });
        div.addEventListener("mousedown", e => {
            if (e.button !== 0) return;
            const canvas_rect = canvas.getBoundingClientRect();
            const [x, y] = [Math.floor((e.clientX - canvas_rect.left) / zoom.current), Math.floor((e.clientY - canvas_rect.top) / zoom.current)];

            const packed = { x, y, ctrl: e.ctrlKey, shift: e.shiftKey, }

            const fn = fn_data.val_local().unwrap()[selected_tool.current];
            if (fn.down) fn.down(packed);
            set_mouse_down(true);
        });
        document.addEventListener("mouseup", e => {
            const canvas_rect = canvas.getBoundingClientRect();
            const [x, y] = [Math.floor((e.clientX - canvas_rect.left) / zoom.current), Math.floor((e.clientY - canvas_rect.top) / zoom.current)];

            const packed = { x, y, ctrl: e.ctrlKey, shift: e.shiftKey, was_down: is_mouse_down }

            const fn = fn_data.val_local().unwrap()[selected_tool.current];
            if (fn.up) fn.up(packed);
            set_mouse_down(false);
        });
        document.addEventListener("keydown", e => {
            if (!e.ctrlKey) return;
            if (!(e.key === "a" || e.key === "c" || e.key === "v" || e.key === "x")) return;
            set_selected_tool_id("select_tool");
            const fns = fn_data.val_local().unwrap();
            if (e.key === "a") {
                e.preventDefault();
                const fn = fns.select_tool.on_ctrl_a;
                if (fn) fn({});
            } else if (e.key === "c") {
                e.preventDefault();
                const fn = fns.select_tool.on_ctrl_c;
                if (fn) fn({});
            } else if (e.key === "v") {
                e.preventDefault();
                const fn = fns.select_tool.on_ctrl_v;
                if (fn) fn({});
            } else if (e.key === "x") {
                e.preventDefault();
                const fn = fns.select_tool.on_ctrl_x;
                if (fn) fn({});
            }
        });
    }, []);

    return (
        <div
            ref={div_ref}
            style={{
                position: "absolute",
                margin: 0,
                width: "100%",
                height: "100%",
                userSelect: "none",
            }}>
            <canvas
                ref={canvas_ref}
                className="has_own_context_menu"
                onContextMenu={e => { e.preventDefault() }}
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

