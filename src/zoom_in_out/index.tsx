import { Equal, ZoomIn, ZoomOut } from "lucide-preact"
import "./index.css"
import { Dispatch, StateUpdater, useEffect, useRef } from "preact/hooks";
import { RefObject } from "preact";

export const ZoomInOut = (props: { zoom_reset_button_ref: RefObject<HTMLDivElement>, zoom: number, set_zoom: Dispatch<StateUpdater<number>> }) => {

    const zoom_set = (z: number | ((arg0: number) => number)) => {
        if (typeof z == "number") {
            props.set_zoom(z);
        } else {
            props.set_zoom(z);
        }
    }
    const text_box_ref = useRef<HTMLInputElement>(null);
    useEffect(() => {
        const text_box = text_box_ref.current;
        if (!text_box) return;
        text_box.value = `${Math.round(props.zoom * 100) / 100}`;
    }, [text_box_ref.current, props.zoom]);

    useEffect(() => {
        const text_box = text_box_ref.current;
        if (!text_box) return;
        text_box.onchange
    }, [text_box_ref.current]);

    return (
        <div id="zoom_in_out">
            <div id="zoom_ratio_outer"><div id="zoom_ratio_inner">1 : <input
                ref={text_box_ref}
                onInput={(e) => {
                    const raw_v = Number.parseFloat((e.target as unknown as HTMLInputElement).value);
                    const v = 0 < raw_v ? raw_v : 1
                    zoom_set(v);
                    (e.target as unknown as HTMLInputElement).value = `${v}`;
                }}
                type="number"
                id="zoom_text_box"
            /></div></div>
            <div id="zoom_in_out_button_outer">
                <div class="zoom_in_out_button" id="zoom_out_button" onClick={() => zoom_set(v => Math.max(0.5, v / (2 ** (1 / 8))))}>   <ZoomOut size="20px" /></div>
                <div class="zoom_in_out_button" id="zoom_reset_button" ref={props.zoom_reset_button_ref} onClick={() => zoom_set(1)}> <Equal size="20px" /></div>
                <div class="zoom_in_out_button" id="zoom_in_button" onClick={() => zoom_set(v => v * (2 ** (1 / 8)))}>    <ZoomIn size="20px" /></div>
            </div>
        </div>
    )
}
