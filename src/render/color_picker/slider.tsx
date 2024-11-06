import { useEffect, useRef, useState } from "react";
import "./slider.css";
import { useAtomValue } from "jotai";
import { color_theme_atom, ColorTheme } from "../../logic/color_theme";

export const Slider = ({
    setter,
    val,
    max = 100,
    min = 0,
    width = 100,
    height = 20,
    background = undefined
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

    useAtomValue(color_theme_atom);

    useEffect(() => {
        const knob = knob_ref.current;
        if (!knob) return;
        let start_ptr_x = 0;
        let start_v = 0;
        const on_mousedown = (e: MouseEvent) => {
            if (!is_dragging) {
                start_ptr_x = e.clientX;
                setter(_ => { start_v = Math.min(max, Math.max(min, _)); return _; })
                set_dragging(true);
                is_dragging = true;
            }
        }
        const on_mousemove = (e: MouseEvent) => {
            if (is_dragging) {
                const v = Math.min(max, Math.max(min, (e.clientX - start_ptr_x) / width * max + start_v));
                setter(Math.floor(v));
            }
        }
        const on_mouseup = (e: MouseEvent) => {
            if (is_dragging) {
                const v = Math.min(max, Math.max(min, (e.clientX - start_ptr_x) / width * max + start_v));
                setter(Math.floor(v));
                set_dragging(false);
                is_dragging = false;
            }
        }
        knob.addEventListener("mousedown", on_mousedown);
        document.addEventListener("mousemove", on_mousemove);
        document.addEventListener("mouseup", on_mouseup);
        return () => {
            knob.removeEventListener("mousedown", on_mousedown);
            document.removeEventListener("mousemove", on_mousemove);
            document.removeEventListener("mouseup", on_mouseup);
        }
    }, []);

    return (<div className="common_slider" style={{
        width: width,
        height: height,
        background: background ?? ColorTheme.current.on_some(t => t.val.slider_default).unwrap_or("#0000"),
    }}>
        <div className="common_slider_inner">
            <div ref={knob_ref} className="common_slider_knob" style={{
                left: val / max * width - 5,
                top: -3,
                width: 10,
                height: height + 6
            }} ></div>
        </div>
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
    background = undefined,
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

    return (<div className="common_slider_with_box_outer" style={{
        width: width + box_width + 15
    }}>
        <Slider
            setter={setter}
            val={val}
            max={max}
            min={min}
            width={width}
            height={height}
            background={background}
        />
        <input ref={box_ref} type="number" className="common_slider_with_box_box" style={{
            left: width + 10,
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