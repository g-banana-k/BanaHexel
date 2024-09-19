import "./index.css"
import { useEffect, useRef, useState } from "react";
import { background_image } from "./background";
import { useRecoilState, useRecoilValue } from "recoil";
import { zoom_state } from "../zoom_in_out";
import { scroll_horizontal_state, scroll_vertical_state, ScrollBarHorizontal, ScrollBarVertical } from "./scroll_bar";
import { current_layer_state, layer_arr_state, window_size_state } from "../App";

export const CanvasArea = () => {
    const [current_layer, set_current_layer] = useRecoilState(current_layer_state);
    const [layer_arr, set_layer_arr] = useRecoilState(layer_arr_state);

    const [zoom, set_zoom] = useRecoilState(zoom_state);
    const [scroll_horizontal, set_scroll_horizontal] = useRecoilState(scroll_horizontal_state)
    const [scroll_vertical, set_scroll_vertical] = useRecoilState(scroll_vertical_state)
    const window_size = useRecoilValue(window_size_state);

    const canvas_body_ref = useRef<HTMLDivElement>(null);
    const canvas_background_ref = useRef<HTMLDivElement>(null);
    const canvas_area_ref = useRef<HTMLDivElement>(null);

    let [canvas_height, set_canvas_height] = useState(0);
    let [canvas_width, set_canvas_width] = useState(0);
    let [area_height, set_area_height] = useState(0);
    let [area_width, set_area_width] = useState(0);

    const [background_width, set_background_width] = useState(0);
    const [background_height, set_background_height] = useState(0);

    useEffect(() => {
        const area = canvas_area_ref.current;
        if (!area) return;
        let c_h = canvas_height;
        let c_w = canvas_width;
        area.onwheel = e => {
            if (e.deltaY == 0) return;
            if (!e.shiftKey && !e.ctrlKey) {
                let z = 0;
                set_zoom(_ => { z = _; return _; })
                set_canvas_height(_ => { c_h = _; return _; });
                set_scroll_vertical(s => Math.max(-0.5, Math.min(0.5, s + Math.sign(e.deltaY) / (c_h / 20 * z))))
            } else if (e.shiftKey && !e.ctrlKey) {
                let z = 0;
                set_zoom(_ => { z = _; return _; })
                set_canvas_width(_ => { c_w = _; return _; });
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
        const div_back = canvas_background_ref.current;
        const new_layer = layer_arr![current_layer];
        const background = background_image(Math.max(new_layer.body.width, new_layer.body.height) / 4, ["#111", "#222"]);
        if (!(div_body && div_back && new_layer)) return;

        if (div_body.hasChildNodes()) div_body.removeChild(div_body.firstChild!);
        div_body.appendChild(new_layer.body);
        set_canvas_height(new_layer.body.height);
        set_canvas_width(new_layer.body.width);
        new_layer.body.style.height = "100%"
        new_layer.body.style.width = "100%"

        if (div_back.hasChildNodes()) div_back.removeChild(div_back.firstChild!);
        div_back.appendChild(background);
        set_background_height(background.height);
        set_background_width(background.width);
        background.style.height = "100%"
        background.style.width = "100%"
    }, [current_layer, layer_arr]);

    return (<div id="canvas_area" ref={canvas_area_ref}>
        <div id="canvas_background_div" ref={canvas_background_ref} style={{
            left: (-0.5 * background_width * zoom * 8) + (0.5 * area_width) - (scroll_horizontal * canvas_width * zoom),
            top: (-0.5 * background_height * zoom * 8) + (0.5 * area_height) - (scroll_vertical * canvas_height * zoom),
            width: background_width * zoom * 8,
            height: background_height * zoom * 8,
        }}></div>
        <div id="canvas_body_div" ref={canvas_body_ref} style={{
            left: (-0.5 * canvas_width * zoom) + (0.5 * area_width) - (scroll_horizontal * canvas_width * zoom),
            top: (-0.5 * canvas_height * zoom) + (0.5 * area_height) - (scroll_vertical * canvas_height * zoom),
            width: canvas_width * zoom,
            height: canvas_height * zoom,
        }}></div>
        <div style={{
            position:"absolute",
            left: (-0.5 * canvas_width * zoom) + (0.5 * area_width) - (scroll_horizontal * canvas_width * zoom),
            top: (-0.5 * canvas_height * zoom) + (0.5 * area_height) - (scroll_vertical * canvas_height * zoom),
            width: canvas_width * zoom,
            height: canvas_height * zoom,
            backgroundColor: "#0000",
            outline: `${canvas_width+canvas_height}px solid #333`,
        }} />
        <ScrollBarVertical
            canvas_height={canvas_height}
            area_height={area_height}
        />
        <ScrollBarHorizontal
            canvas_width={canvas_width}
            area_width={area_width}
        />
    </div >)
}
