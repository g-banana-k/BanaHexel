import "./index.css"
import { useEffect, useRef, useState } from "preact/hooks";
import { layerT } from "../data";
import { window_sizeT } from "../App";
import { ScrollBarHorizontal, ScrollBarVertical } from "./scroll_bar";
import { Dispatch, StateUpdater } from "preact/hooks";
import { background_image } from "./background";
import { RefObject } from "preact";

export const CanvasArea = (props: {
    layer_arr: layerT[],
    current_layer: number,
    set_layer_arr: (arg0: layerT[]) => void,
    window_size: window_sizeT,
    zoom: number,
    set_zoom: Dispatch<StateUpdater<number>>,
    zoom_reset_button_ref: RefObject<HTMLDivElement>,

}) => {
    const canvas_body_ref = useRef<HTMLDivElement>(null);
    const canvas_background_ref = useRef<HTMLDivElement>(null);
    const canvas_area_ref = useRef<HTMLDivElement>(null);

    const [canvas_height, set_canvas_height] = useState(0);
    const [canvas_width, set_canvas_width] = useState(0);
    const [area_height, set_area_height] = useState(0);
    const [area_width, set_area_width] = useState(0);

    const [background_width, set_background_width] = useState(0);
    const [background_height, set_background_height] = useState(0);

    let [scroll_vertical  , set_scroll_vertical] = useState(0);
    let [scroll_horizontal, set_scroll_horizontal] = useState(0);

    useEffect(() => {
        set_area_height(canvas_area_ref.current?.clientHeight ?? 0);
        set_area_width(canvas_area_ref.current?.clientWidth ?? 0);
    }, [props.window_size]);

    useEffect(() => {
        const div_body = canvas_body_ref.current;
        const div_back = canvas_background_ref.current;
        const new_layer = props.layer_arr[props.current_layer];
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
    }, [props.current_layer]);

    useEffect(() => {
        const area = canvas_area_ref.current;
        if (!area) return;
        area.onwheel = e => {
            if (e.deltaY != 0 && e.ctrlKey) {
                props.set_zoom(v => Math.max(0.5, v / ((2 ** (1 / 8)) ** Math.sign(e.deltaY))));
            }
        }
    }, [canvas_area_ref.current])

    return (<div id="canvas_area" ref={canvas_area_ref}>
        <div id="canvas_background_div" ref={canvas_background_ref} style={{
            left: (-0.5 * background_width * props.zoom * 8) + (0.5 * area_width) - (scroll_horizontal * canvas_width * props.zoom),
            top: (-0.5 * background_height * props.zoom * 8) + (0.5 * area_height) - (scroll_vertical * canvas_height * props.zoom),
            width: background_width * props.zoom * 8,
            height: background_height * props.zoom * 8,
        }}>
        </div>
        <div id="canvas_body_div" ref={canvas_body_ref} style={{
            //left: (scroll_horizontal + 0.5) * (area_width  - canvas_width  * props.zoom),
            //top : (scroll_vertical   + 0.5) * (area_height - canvas_height * props.zoom),
            left: (-0.5 * canvas_width * props.zoom) + (0.5 * area_width) - (scroll_horizontal * canvas_width * props.zoom),
            top: (-0.5 * canvas_height * props.zoom) + (0.5 * area_height) - (scroll_vertical * canvas_height * props.zoom),
            width: canvas_width * props.zoom,
            height: canvas_height * props.zoom,
        }}>
        </div>
        <ScrollBarVertical
            canvas_area={canvas_area_ref.current}
            set_scroll_vertical={set_scroll_vertical}
            canvas_height={canvas_height}
            area_height={area_height}
            zoom={props.zoom}
            zoom_reset_button_ref={props.zoom_reset_button_ref}
        />
        <ScrollBarHorizontal
            canvas_area={canvas_area_ref.current}
            set_scroll_horizontal={set_scroll_horizontal}
            canvas_width={canvas_width}
            area_width={area_width}
            zoom={props.zoom}
            zoom_reset_button_ref={props.zoom_reset_button_ref}
        />
    </div >)
}
