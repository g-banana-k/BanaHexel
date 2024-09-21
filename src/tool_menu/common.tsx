import { useEffect, useRef, useState } from "react";
import "./common.css";

export const Slider = ({
    setter,
    val,
    max = 100,
    min = 0,
    width = 100,
    height = 20,
    background = "#fff"
}: {
    setter: (w: ((v: number) => number) | number) => void,
    val: number,
    max?: number,
    min?: number,
    width?: number,
    height?: number,
    background?: string
}) => {
    const knob_ref = useRef<HTMLDivElement>(null);

    let [is_dragging, set_dragging] = useState(false);

    let [once, set_once] = useState(true);

    useEffect(() => {
        const knob = knob_ref.current;
        if (!knob) return;
        if (!once) return;
        set_once(true);
        once = true;
        let start_ptr_x = 0;
        let start_v = 0;
        knob.addEventListener("mousedown", e => {
            if (!is_dragging) {
                start_ptr_x = e.clientX;
                setter(_ => { start_v = _; return _; })
                set_dragging(true);
                is_dragging = true;
            }
        });
        document.addEventListener("mousemove", e => {
            if (is_dragging) {
                console.log((e.clientX - start_ptr_x) / width * max + start_v)
                const v = Math.min(max, Math.max(min, (e.clientX - start_ptr_x) / width * max + start_v));
                setter(Math.floor(v));
            }
        });
        document.addEventListener("mouseup", e => {
            if (is_dragging) {
                const v = Math.min(max, Math.max(min, (e.clientX - start_ptr_x) / width * max + start_v));
                setter(Math.floor(v));
                set_dragging(false);
                is_dragging = false;
            }
        });
    }, []);

    return (<div className="tool_menu_slider" style={{
        width: width,
        height: height,
        background: background,
    }}>
        <div ref={knob_ref} className="tool_menu_slider_knob" style={{
            left: val / max * width - 5,
            top: -3,
            width: 10,
            height: height + 6
        }} ></div>
    </div>)
}

export const SliderWithBox = ({
    setter,
    val,
    max = 100,
    min = 0,
    width = 100,
    height = 20,
    box_width = 60,
    background = "#fff"
}: {
    setter: (w: ((v: number) => number) | number) => void,
    val: number,
    max?: number,
    min?: number,
    width?: number,
    height?: number,
    box_width?: number,
    background?: string
}) => {
    const box_ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const box = box_ref.current;
        if (!box) return;
        box.value = `${Math.min(max, Math.max(min, val))}`;
    }, [val]);

    return (<div className="tool_menu_slider_with_box_outer">
        <Slider
            setter={setter}
            val={val}
            max={max}
            min={min}
            width={width}
            height={height}
            background={background}
        />
        <input ref={box_ref} type="number" className="tool_menu_slider_with_box_box" style={{
            left: width + 5,
            height: height,
            width: box_width
        }} onInput={(e) => {
            const raw_v = Number.parseInt((e.target as unknown as HTMLInputElement).value) || 0;
            const v = Math.min(max, Math.max(min, raw_v));
            setter(v);
            (e.target as unknown as HTMLInputElement).value = `${v}`;
        }} />
    </div>)
}