import { useAtom, useAtomValue } from "jotai";
import { canvas_size_atom, current_layer_atom, layer_arr_atom } from "../../app";
import "./index.css"
import { layers_display_opacity_atom } from "../layer_option";
import { zoom_atom } from "../zoom_in_out";
import { window_size_atom } from "../../window";
import { scroll_horizontal_atom, scroll_vertical_atom, ScrollBarHorizontal, ScrollBarVertical } from "./scroll_bar";
import { useEffect, useRef, useState } from "react";
import { color_theme_atom, ColorTheme } from "../color_theme";
import { background_image } from "../../logic/canvas_area/background";
import { CanvasEditor } from "../../logic/canvas_area/editor";
import { SetterOrUpdater } from "../../logic/utils";

export const CanvasArea = () => {
    const [current_layer, _set_current_layer] = useAtom(current_layer_atom);
    const [layer_arr, _set_layer_arr] = useAtom(layer_arr_atom);
    const layer_display_opacity = useAtomValue(layers_display_opacity_atom);

    const [zoom, set_zoom] = useAtom(zoom_atom);
    const [scroll_horizontal, set_scroll_horizontal] = useAtom(scroll_horizontal_atom)
    const [scroll_vertical, set_scroll_vertical] = useAtom(scroll_vertical_atom)
    const window_size = useAtomValue(window_size_atom);

    const canvas_body_ref = useRef<HTMLDivElement>(null);
    const canvas_background_ref = useRef<HTMLDivElement>(null);
    const canvas_area_ref = useRef<HTMLDivElement>(null);

    const canvas_back_ref = useRef<HTMLDivElement>(null);
    const canvas_front_ref = useRef<HTMLDivElement>(null);

    const [canvas_size, set_canvas_size] = useAtom(canvas_size_atom) as unknown as [{ width: number; height: number; }, SetterOrUpdater<{ width: number; height: number; }>];
    let [area_height, set_area_height] = useState(0);
    let [area_width, set_area_width] = useState(0);

    const [background_width, set_background_width] = useState(0);
    const [background_height, set_background_height] = useState(0);

    useAtomValue(color_theme_atom);

    useEffect(() => {
        const area = canvas_area_ref.current;
        if (!area) return;
        let c_h = canvas_size?.height;
        let c_w = canvas_size?.width;
        area.onwheel = e => {
            if (e.deltaY == 0) return;
            if (!e.shiftKey && !e.ctrlKey) {
                let z = 0;
                set_zoom(_ => { z = _; return _; })
                set_canvas_size(_ => { c_h = _.height; return _; });
                set_scroll_vertical(s => Math.max(-0.5, Math.min(0.5, s + Math.sign(e.deltaY) / (c_h / 20 * z))))
            } else if (e.shiftKey && !e.ctrlKey) {
                let z = 0;
                set_zoom(_ => { z = _; return _; })
                set_canvas_size(_ => { c_w = _.width; return _; });
                set_scroll_horizontal(s => Math.max(-0.5, Math.min(0.5, s + Math.sign(e.deltaY) / (c_w / 20 * z))))
            } else if (e.deltaY != 0 && e.ctrlKey) {
                set_zoom(v => Math.max(0.5, v / ((2 ** (1 / 8)) ** Math.sign(e.deltaY))));
            }
        }
    }, [canvas_area_ref.current]);

    useEffect(() => {
        set_area_height(canvas_area_ref.current?.clientHeight ?? 0);
        set_area_width(canvas_area_ref.current?.clientWidth ?? 0);
    }, [window_size]);

    useEffect(() => {
        const div_body = canvas_body_ref.current;
        const div_back = canvas_back_ref.current;
        const div_front = canvas_front_ref.current;
        const new_layer = layer_arr![current_layer];
        if (!(div_body && div_back && div_front && new_layer)) return;

        div_back.innerHTML = "";
        div_body.innerHTML = "";
        div_front.innerHTML = "";
        set_canvas_size({
            height: new_layer.body.height,
            width: new_layer.body.width,
        })
        layer_arr!.forEach(({ body }, i) => {
            if (i < current_layer) {
                div_back.appendChild(body);
                body.style.height = "100%";
                body.style.width = "100%";
            } else if (i == current_layer) {
                div_body.appendChild(body);
                body.style.height = "100%";
                body.style.width = "100%";
            } else {
                div_front.appendChild(body);
                body.style.height = "100%";
                body.style.width = "100%";
            }
        });
    }, [current_layer, layer_arr]);

    useEffect(() => {
        const div_background = canvas_background_ref.current;
        const new_layer = layer_arr![current_layer];
        const background = background_image(Math.max(new_layer.body.width, new_layer.body.height) / 4, [
            ColorTheme.current.on_some<string | undefined>(t => t.val.canvas_background_1).unwrap_or(undefined),
            ColorTheme.current.on_some<string | undefined>(t => t.val.canvas_background_2).unwrap_or(undefined),
        ]);
        if (!(div_background && new_layer)) return;

        if (div_background.hasChildNodes()) div_background.removeChild(div_background.firstChild!);
        div_background.appendChild(background);
        set_background_height(background.height);
        set_background_width(background.width);
        background.style.height = "100%";
        background.style.width = "100%";
    }, [layer_arr, ColorTheme.current]);

    return (<div id="canvas_area" ref={canvas_area_ref}>
        <div id="canvas_background_div" ref={canvas_background_ref} style={{
            left: (0.5 * area_width) - ((scroll_horizontal + 0.5) * canvas_size.width * zoom),
            top: (0.5 * area_height) - ((scroll_vertical + 0.5) * canvas_size.height * zoom),
            width: background_width * zoom * 8,
            height: background_height * zoom * 8,
        }}></div>
        <div id="canvas_layers_back_div" ref={canvas_back_ref} style={{
            left: (-0.5 * canvas_size.width * zoom) + (0.5 * area_width) - (scroll_horizontal * canvas_size.width * zoom),
            top: (-0.5 * canvas_size.height * zoom) + (0.5 * area_height) - (scroll_vertical * canvas_size.height * zoom),
            width: canvas_size.width * zoom,
            height: canvas_size.height * zoom,
            opacity: layer_display_opacity.back / 100,
        }}></div>
        <div id="canvas_body_div" ref={canvas_body_ref} style={{
            left: (-0.5 * canvas_size.width * zoom) + (0.5 * area_width) - (scroll_horizontal * canvas_size.width * zoom),
            top: (-0.5 * canvas_size.height * zoom) + (0.5 * area_height) - (scroll_vertical * canvas_size.height * zoom),
            width: canvas_size.width * zoom,
            height: canvas_size.height * zoom,
        }}></div>
        <CanvasEditor
            canvas_width={canvas_size.width}
            canvas_height={canvas_size.height}
            zoom={zoom}
            area_width={area_width}
            area_height={area_height}
            scroll_horizontal={scroll_horizontal}
            scroll_vertical={scroll_vertical}
        />
        <div id="canvas_layers_front_div" ref={canvas_front_ref} style={{
            left: (-0.5 * canvas_size.width * zoom) + (0.5 * area_width) - (scroll_horizontal * canvas_size.width * zoom),
            top: (-0.5 * canvas_size.height * zoom) + (0.5 * area_height) - (scroll_vertical * canvas_size.height * zoom),
            width: canvas_size.width * zoom,
            height: canvas_size.height * zoom,
            opacity: layer_display_opacity.front / 100,
        }}></div>
        <div style={{
            position: "absolute",
            left: (-0.5 * canvas_size.width * zoom) + (0.5 * area_width) - (scroll_horizontal * canvas_size.width * zoom),
            top: (-0.5 * canvas_size.height * zoom) + (0.5 * area_height) - (scroll_vertical * canvas_size.height * zoom),
            width: canvas_size.width * zoom,
            height: canvas_size.height * zoom,
            backgroundColor: "#0000",
            outline: `${area_width + area_height}px solid ${ColorTheme.current.on_some(t => t.val.canvas_area_distant_view).unwrap_or("#0000")}`,
            pointerEvents: "none",
        }} />
        <ScrollBarVertical
            canvas_height={canvas_size.height}
            area_height={area_height}
        />
        <ScrollBarHorizontal
            canvas_width={canvas_size.width}
            area_width={area_width}
        />
    </div >)
}

export const canvas_tools = [
    "none",
    "brush_tool",
    "line_tool",
    "eraser_tool",
    "bucket_tool",
    "stamp_tool",
    "select_tool",
    "rect_tool",
] as const;

export type canvas_toolsT = typeof canvas_tools[number]