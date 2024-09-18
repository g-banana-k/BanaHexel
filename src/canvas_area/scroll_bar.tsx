import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { atom, useRecoilState, useRecoilValue } from "recoil";
import { window_size_state } from "../App";
import { zoom_state } from "../zoom_in_out";

export const scroll_vertical_state = atom({
    key: "canvas_scroll_vertical_state",
    default: 0,
});

export const scroll_horizontal_state = atom({
    key: "canvas_scroll_horizontal_state",
    default: 0,
});

export const ScrollBarVertical = (props: {
    canvas_height: number,
    area_height: number,
    set_canvas_height: Dispatch<SetStateAction<number>>,
    set_area_height  : Dispatch<SetStateAction<number>>,
}) => {
    let [scroll, set_scroll] = useRecoilState(scroll_vertical_state);
    const zoom = useRecoilValue(zoom_state);

    let [is_dragging, set_dragging] = useState(false);

    const bar_height = props.area_height * (props.area_height / (props.canvas_height * (zoom + 1)));
    const bar_move_area = props.area_height * (1 - props.area_height / (props.canvas_height * (zoom + 1)));
    console.log(bar_height, bar_move_area);

    const bar_ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const bar = bar_ref.current;
        if (!bar) return;
        if (props.area_height == 0 || props.area_height == 0) return;
        let start_bar = 0;
        let start_ptr_y = 0;
        bar.addEventListener("mousedown", e => {
            if (!is_dragging) {
                set_scroll(s => { start_bar = s; return s; });
                start_ptr_y = e.pageY;
                set_dragging(true);
                is_dragging = true;
            }
        });
        document.addEventListener("mousemove", e => {
            if (is_dragging) {
                const v = Math.max(-0.5, Math.min(0.5, (e.pageY - start_ptr_y) / bar_move_area + start_bar));
                set_scroll(v);
            }
        });
        document.addEventListener("mouseup", e => {
            if (is_dragging) {
                const v = Math.max(-0.5, Math.min(0.5, (e.pageY - start_ptr_y) / bar_move_area + start_bar));
                set_scroll(v);
                set_dragging(false);
                is_dragging = false;
            }
        });
    }, [bar_ref.current])

    return (
        <div
            ref={bar_ref}
            id="canvas_scroll_bar_vertical"
            className="canvas_scroll_bar"
            style={{
                ...{
                    height: (!Number.isNaN(bar_height) ? bar_height : 0),
                    top: (scroll + 0.5) * (!Number.isNaN(bar_move_area) ? bar_move_area : 0),
                },
                ...(is_dragging ? { backgroundColor: "#0008" } : {})
            }}
        ></div >
    )
}

export const ScrollBarHorizontal = (props: {
    canvas_width: number,
    area_width: number,
}) => {
    let [scroll, set_scroll] = useRecoilState(scroll_horizontal_state);
    const zoom = useRecoilValue(zoom_state);

    let [is_dragging, set_dragging] = useState(false);

    let bar_width = props.area_width * (props.area_width / (props.canvas_width * (zoom + 1)));
    let bar_move_area = props.area_width * (1 - props.area_width / (props.canvas_width * (zoom + 1)));

    const bar_ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const bar = bar_ref.current;
        if (!bar) return;
        if (props.area_width == 0) return;
        let start_bar = 0;
        let start_ptr_x = 0;
        bar.addEventListener("mousedown", e => {
            if (!is_dragging) {
                set_scroll(s => { start_bar = s; return s; });
                start_ptr_x = e.pageX;
                set_dragging(true);
                is_dragging = true;
            }
        });
        document.addEventListener("mousemove", e => {
            if (is_dragging) {
                const v = Math.max(-0.5, Math.min(0.5, (e.pageX - start_ptr_x) / bar_move_area + start_bar));
                set_scroll(v);
            }
        });
        document.addEventListener("mouseup", e => {
            if (is_dragging) {
                const v = Math.max(-0.5, Math.min(0.5, (e.pageX - start_ptr_x) / bar_move_area + start_bar));
                set_scroll(v);
                set_dragging(false);
                is_dragging = false;
            }
        });
    }, [bar_ref.current])

    return (
        <div
            ref={bar_ref}
            id="canvas_scroll_bar_horizontal"
            className="canvas_scroll_bar"
            style={{
                ...{
                    width: (!Number.isNaN(bar_width) ? bar_width : 0),
                    left: (scroll + 0.5) * (!Number.isNaN(bar_move_area) ? bar_move_area : 0),
                },
                ...(is_dragging ? { backgroundColor: "#0008" } : {})
            }}
        ></div >
    )
}
