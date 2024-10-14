import { Equal, ZoomIn, ZoomOut } from "lucide-react"
import "./index.css"
import { useEffect, useRef } from "react";
import { atom, useAtom, useSetAtom } from "jotai";
import { scroll_horizontal_atom, scroll_vertical_atom } from "../canvas_area/scroll_bar";

export const zoom_atom = atom(8)

export const ZoomInOut = () => {
    const [zoom, set_zoom] = useAtom(zoom_atom);
    const set_scroll_vertical = useSetAtom(scroll_vertical_atom);
    const set_scroll_horizontal = useSetAtom(scroll_horizontal_atom);
    const text_box_ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const text_box = text_box_ref.current;
        if (!text_box) return;
        text_box.value = `${Math.round(zoom * 100) / 100}`;
    }, [text_box_ref.current, zoom]);

    return (
        <div id="zoom_in_out">
            <div id="zoom_ratio_outer"><div id="zoom_ratio_inner">1 : <input
                ref={text_box_ref}
                onInput={(e) => {
                    const raw_v = Number.parseFloat((e.target as unknown as HTMLInputElement).value);
                    const v = 0 < raw_v ? raw_v : 1
                    set_zoom(v);
                    (e.target as unknown as HTMLInputElement).value = `${v}`;
                }}
                type="number"
                id="zoom_text_box"
            /></div></div>
            <div id="zoom_in_out_button_outer">
                <div className="zoom_in_out_button" id="zoom_out_button" onClick={() => set_zoom(v => Math.max(0.5, v / (2 ** (1 / 8))))}><ZoomOut size="20px" /></div>
                <div className="zoom_in_out_button" id="zoom_reset_button" onClick={() => { set_zoom(1); set_scroll_vertical(0); set_scroll_horizontal(0); }}><Equal size="20px" /></div>
                <div className="zoom_in_out_button" id="zoom_in_button" onClick={() => set_zoom(v => v * (2 ** (1 / 8)))}><ZoomIn size="20px" /></div>
            </div>
        </div>
    )
}
