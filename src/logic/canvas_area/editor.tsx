import { useEffect, useRef, useState } from "react"
import { canvas_toolsT } from "../../render/canvas_area";
import { editor_tools } from "./tools";
import { undo_stack } from "./undo";
import { current_layer_atom, layer_arr_atom } from "../../app";
import { Option, State } from "../utils";
import { selected_tool_id_atom } from "../../render/tool_select";
import { brush_tool_color_atom, brush_tool_thickness_atom, eraser_tool_thickness_atom } from "../../render/tool_menu";
import { file_save_state_atom } from "../../window";
import { atom, useAtom } from "jotai";

type CanvasEditorPropsT = {
    canvas_width: number,
    canvas_height: number,
    zoom: number,
    area_width: number,
    area_height: number,
    scroll_horizontal: number,
    scroll_vertical: number,
}

export const is_mouse_down_in_editor_atom = atom(false)

export const CanvasEditor = ({
    canvas_width,
    canvas_height,
    zoom: z,
    area_width,
    area_height,
    scroll_horizontal,
    scroll_vertical,
}: CanvasEditorPropsT) => {
    let [once, set_once] = useState(true);
    let [is_mouse_down, set_mouse_down_raw] = useAtom(is_mouse_down_in_editor_atom);
    const layers_arr = new State(useAtom(layer_arr_atom));
    const current_layer = new State(useAtom(current_layer_atom));

    const set_mouse_down = (b: ((currVal: boolean) => boolean) | boolean) => {
        const v = typeof b === "function" ? b(is_mouse_down) : b;
        set_mouse_down_raw(v);
        is_mouse_down = v;
    }

    const div_ref = useRef<HTMLDivElement>(null);
    const canvas_ref = useRef<HTMLCanvasElement>(null);

    const [selected_tool_id, set_selected_tool_id] = useAtom(selected_tool_id_atom);
    const selected_tool = useRef<canvas_toolsT>("none");
    const brush_color = new State(useAtom(brush_tool_color_atom));
    const brush_thickness = new State(useAtom(brush_tool_thickness_atom));
    const eraser_thickness = new State(useAtom(eraser_tool_thickness_atom));
    const file_state = new State(useAtom(file_save_state_atom));
    const need_on_end = new State(useState(true))

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
            current_layer,
            undo_stack,
            file_state,
            need_on_end
        })));
        const on_mousemove = (e: MouseEvent) => {
            const canvas_rect = canvas.getBoundingClientRect();
            const [f_x, f_y] = [(e.clientX - canvas_rect.left) / zoom.current, (e.clientY - canvas_rect.top) / zoom.current];
            const [x, y] = [Math.floor(f_x), Math.floor(f_y)];
            const packed = { f_x, f_y, x, y, ctrl: e.ctrlKey, shift: e.shiftKey, zoom: zoom.current }
            const fn = fn_data.val_local().unwrap()[selected_tool.current];
            if (is_mouse_down) {
                if (fn.tool_move) fn.tool_move(packed);
            } else if (div.contains(e.target as Node | null)) {
                if (fn.move) fn.move(packed);
            }
        };
        const on_mousedown = (e: MouseEvent) => {
            if (e.button !== 0) return;
            const canvas_rect = canvas.getBoundingClientRect();
            const [f_x, f_y] = [(e.clientX - canvas_rect.left) / zoom.current, (e.clientY - canvas_rect.top) / zoom.current];
            const [x, y] = [Math.floor(f_x), Math.floor(f_y)];
            const packed = { f_x, f_y, x, y, ctrl: e.ctrlKey, shift: e.shiftKey, zoom: zoom.current }

            const fn = fn_data.val_local().unwrap()[selected_tool.current];
            if (fn.down) fn.down(packed);
            set_mouse_down(true);
        };
        const on_mouseup = (e: MouseEvent) => {
            const canvas_rect = canvas.getBoundingClientRect();
            const [f_x, f_y] = [(e.clientX - canvas_rect.left) / zoom.current, (e.clientY - canvas_rect.top) / zoom.current];
            const [x, y] = [Math.floor(f_x), Math.floor(f_y)];
            const packed = { f_x, f_y, x, y, ctrl: e.ctrlKey, shift: e.shiftKey, was_down: is_mouse_down, zoom: zoom.current }
            const fn = fn_data.val_local().unwrap()[selected_tool.current];
            if (fn.up) fn.up(packed);
            set_mouse_down(false);
        };
        document.addEventListener("mousemove", on_mousemove);
        div.addEventListener("mousedown", on_mousedown);
        document.addEventListener("mouseup", on_mouseup);
        const on_keydown = (e: KeyboardEvent) => {
            if ((e.target as HTMLElement | undefined)?.tagName === "INPUT") return;
            if (!e.ctrlKey) {
                if (!["ArrowUp", "ArrowDown", "ArrowRight", "ArrowLeft"].includes(e.key)) return;
                e.preventDefault();
                const fns = fn_data.val_local().unwrap();
                const fn = fns.select_tool.on_arrow_down;
                const kind = ({ "ArrowUp": "up", "ArrowDown": "down", "ArrowRight": "right", "ArrowLeft": "left" } as const)[e.key]!;
                if (fn) fn({ kind });
            } else {
                if (!("acvxyz".includes(e.key))) return;
                file_state.set(_ => ({ ..._,  saved: false}));
                if ("acvx".includes(e.key)) set_selected_tool_id("select_tool");
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
                } else if (e.key === "y") {
                    e.preventDefault();
                    const fn = fns[selected_tool.current].on_ctrl_y;
                    const f = fn ? fn({}) : true;
                    if (f) undo_stack.redo().on_some(({ i, r }) => {
                        const layers = layers_arr.val_global()!;
                        const layer = layers[i];
                        const ctx = layer.ctx;
                        ctx.clearRect(r.x, r.y, r.area.width, r.area.height);
                        ctx.drawImage(r.area, r.x, r.y);
                        layer.preview_update();
                        layers_arr.set([...layers]);
                    });
                } else if (e.key === "z") {
                    e.preventDefault();
                    const fn = fns[selected_tool.current].on_ctrl_z;
                    const f = fn ? fn({}) : true;
                    if (f) undo_stack.undo().on_some(({ i, u }) => {
                        const layers = layers_arr.val_global()!;
                        const layer = layers[i];
                        const ctx = layer.ctx;
                        ctx.clearRect(u.x, u.y, u.area.width, u.area.height);
                        ctx.drawImage(u.area, u.x, u.y);
                        layer.preview_update();
                        layers_arr.set([...layers]);
                    });
                }
            }
        }
        const on_keyup = (e: KeyboardEvent) => {
            if ((e.target as HTMLElement | undefined)?.tagName === "INPUT") return;
            if (!e.ctrlKey) {
                if (!["ArrowUp", "ArrowDown", "ArrowRight", "ArrowLeft"].includes(e.key)) return;
                e.preventDefault();
                const fns = fn_data.val_local().unwrap();
                const fn = fns.select_tool.on_arrow_up;
                const kind = ({ "ArrowUp": "up", "ArrowDown": "down", "ArrowRight": "right", "ArrowLeft": "left" } as const)[e.key]!;
                if (fn) fn({ kind });
            }
        }
        document.addEventListener("keydown", on_keydown);
        document.addEventListener("keyup", on_keyup);
        return () => {
            document.removeEventListener("mousemove", on_mousemove);
            div.removeEventListener("mousedown", on_mousedown);
            document.removeEventListener("mouseup", on_mouseup);
            document.removeEventListener("keydown", on_keydown);
            document.removeEventListener("keyup", on_keyup);
            fn_data.set(Option.None());
        }
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

