import { useEffect, useRef, useState } from "react";
import { atom, useAtom, useAtomValue } from "jotai";
import { color_theme_atom } from "../../logic/color_theme";
import { zoom_atom } from "../zoom_in_out";

export const scroll_vertical_atom = atom( 0);

export const scroll_horizontal_atom = atom(0);

export const ScrollBarVertical = (props: {
    canvas_height: number,
    area_height: number,
}) => {
    const color_theme = useAtomValue(color_theme_atom)
    let [scroll, set_scroll] = useAtom(scroll_vertical_atom);
    const zoom = useAtomValue(zoom_atom);
    let [once, set_once] = useState(false);

    let [is_dragging, set_dragging] = useState(false);

    const bar_height = useRef(0);
    bar_height.current = props.area_height * (props.area_height / (props.canvas_height * (zoom + 1)));
    const bar_move_area = useRef(0);
    bar_move_area.current = props.area_height * (1 - props.area_height / (props.canvas_height * (zoom + 1)));

    const bar_ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const bar = bar_ref.current;
        if (!bar) return;
        if (once) return;
        set_once(true);
        once = true;
        let start_bar = 0;
        let start_ptr_y = 0;
        const on_mousedown = (e: MouseEvent) => {
            if (!is_dragging) {
                set_scroll(s => { start_bar = s; return s; });
                start_ptr_y = e.pageY;
                set_dragging(true);
                is_dragging = true;
            }
        }
        const on_mousemove = (e: MouseEvent) => {
            if (is_dragging) {
                const v = Math.max(-0.5, Math.min(0.5, (e.pageY - start_ptr_y) / bar_move_area.current + start_bar));
                set_scroll(v);
            }
        }
        const on_mouseup = (e: MouseEvent) => {
            if (is_dragging) {
                const v = Math.max(-0.5, Math.min(0.5, (e.pageY - start_ptr_y) / bar_move_area.current + start_bar));
                set_scroll(v);
                set_dragging(false);
                is_dragging = false;
            }
        }
        bar.addEventListener("mousedown", on_mousedown);
        document.addEventListener("mousemove", on_mousemove);
        document.addEventListener("mouseup", on_mouseup);
        return () => {
            bar.removeEventListener("mousedown", on_mousedown);
            document.removeEventListener("mousemove", on_mousemove);
            document.removeEventListener("mouseup", on_mouseup);
        }
    }, [])

    return (
        <div
            ref={bar_ref}
            id="canvas_scroll_bar_vertical"
            className="canvas_scroll_bar has_own_context_menu"
            onContextMenu={e => { e.preventDefault() }}
            style={{
                ...{
                    userSelect: "none",
                    height: (!Number.isNaN(bar_height) ? bar_height.current : 0),
                    top: (scroll + 0.5) * (!Number.isNaN(bar_move_area.current) ? bar_move_area.current : 0),
                },
                ...(bar_move_area.current <= 0 ? {
                    display: "none"
                } : {}),
                ...(is_dragging ? { backgroundColor: color_theme.on_some(_ => _.val.canvas_scrollbar_3).unwrap_or("#0000") } : {})
            }}
        ></div >
    )
}

export const ScrollBarHorizontal = (props: {
    canvas_width: number,
    area_width: number,
}) => {
    const color_theme = useAtomValue(color_theme_atom)
    let [scroll, set_scroll] = useAtom(scroll_horizontal_atom);
    const zoom = useAtomValue(zoom_atom);
    let [once, set_once] = useState(false);

    let [is_dragging, set_dragging] = useState(false);

    const bar_width = useRef(0);
    bar_width.current = props.area_width * (props.area_width / (props.canvas_width * (zoom + 1)));
    const bar_move_area = useRef(0);
    bar_move_area.current = props.area_width * (1 - props.area_width / (props.canvas_width * (zoom + 1)));

    const bar_ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const bar = bar_ref.current;
        if (!bar) return;
        if (once) return;
        set_once(true);
        once = true;
        let start_bar = 0;
        let start_ptr_x = 0;
        const on_mousedown = (e: MouseEvent) => {
            if (!is_dragging) {
                set_scroll(s => { start_bar = s; return s; });
                start_ptr_x = e.pageX;
                set_dragging(true);
                is_dragging = true;
            }
        };
        const on_mousemove = (e: MouseEvent) => {
            if (is_dragging) {
                const v = Math.max(-0.5, Math.min(0.5, (e.pageX - start_ptr_x) / bar_move_area.current + start_bar));
                set_scroll(v);
            }
        };
        const on_mouseup = (e: MouseEvent) => {
            if (is_dragging) {
                const v = Math.max(-0.5, Math.min(0.5, (e.pageX - start_ptr_x) / bar_move_area.current + start_bar));
                set_scroll(v);
                set_dragging(false);
                is_dragging = false;
            }
        };
        bar.addEventListener("mousedown", on_mousedown);
        document.addEventListener("mousemove", on_mousemove);
        document.addEventListener("mouseup", on_mouseup);
        return () => {
            bar.removeEventListener("mousedown", on_mousedown);
            document.removeEventListener("mousemove", on_mousemove);
            document.removeEventListener("mouseup", on_mouseup);
        }
    }, [])

    return (
        <div
            ref={bar_ref}
            id="canvas_scroll_bar_horizontal"
            className="canvas_scroll_bar has_own_context_menu"
            onContextMenu={e => { e.preventDefault() }}
            style={{
                ...{
                    width: (!Number.isNaN(bar_width.current) ? bar_width.current : 0),
                    left: (scroll + 0.5) * (!Number.isNaN(bar_move_area.current) ? bar_move_area.current : 0),
                    userSelect: "none",
                },
                ...(bar_move_area.current <= 0 ? {
                    display: "none"
                } : {}),
                ...(is_dragging ? { backgroundColor: color_theme.on_some(_ => _.val.canvas_scrollbar_3).unwrap_or("#0000") } : {})
            }}
        ></div >
    )
}
