import { SetterOrUpdater, useRecoilState, useSetRecoilState } from "recoil";
import { SliderWithBox } from "./slider";
import { useEffect, useRef, useState } from "react";
import { Option, State } from "./utils";
import "./color_picker.css"
import { Palette, Plus } from "lucide-react";
import { context_menu_contents_state, context_menu_position_state, context_menu_ref_state, is_context_menu_open_state } from "../context_menu";
import { user_data_state } from "../app";

export const ColorPicker = ({
    color: c,
    set_color: set_c,
    width = 60,
    height = 60,
}: {
    color: string,
    set_color: SetterOrUpdater<string>,
    width?: number,
    height?: number
}) => {
    let is_opening = new State(useState(false));
    let model = new State(useState<typeof color_models[number]>("RGBA"))
    const input_ref = useRef<HTMLInputElement>(null);

    let color = c;
    const set_color = (updater: string | ((prev: string) => string)) => {
        set_c(updater);
        set_c(_ => { color = _; return _; });
    };
    let rgba_r = from_hx(color.substring(1, 3));
    let rgba_g = from_hx(color.substring(3, 5));
    let rgba_b = from_hx(color.substring(5, 7));
    let rgba_a = from_hx(color.substring(7, 9));

    const set_rgba_r = (w: ((v: number) => number) | number) => {
        let u = 0;
        set_color(_ => { u = from_hx(_.substring(1, 3)); return _; });
        const v = typeof w === "number" ? w : w(u);
        rgba_r = v;
        set_color(rgba_to_code(rgba_r, rgba_g, rgba_b, rgba_a))
    }
    const set_rgba_g = (w: ((v: number) => number) | number) => {
        let u = 0;
        set_color(_ => { u = from_hx(_.substring(3, 5)); return _; });
        const v = typeof w === "number" ? w : w(u);
        rgba_g = v;
        set_color(rgba_to_code(rgba_r, rgba_g, rgba_b, rgba_a))
    }
    const set_rgba_b = (w: ((v: number) => number) | number) => {
        let u = 0;
        set_color(_ => { u = from_hx(_.substring(5, 7)); return _; });
        const v = typeof w === "number" ? w : w(u);
        rgba_b = v;
        set_color(rgba_to_code(rgba_r, rgba_g, rgba_b, rgba_a))
    }
    const set_rgba_a = (w: ((v: number) => number) | number) => {
        let u = 0;
        set_color(_ => { u = from_hx(_.substring(7, 9)); return _; });
        const v = typeof w === "number" ? w : w(u);
        rgba_a = v;
        set_color(rgba_to_code(rgba_r, rgba_g, rgba_b, rgba_a))
    }

    useEffect(() => {
        const input = input_ref.current;
        if (!input) return;
        input.value = color;
    }, [input_ref.current, color])

    const container_ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const container = container_ref.current;
        if (!container) return;
        document.addEventListener("mousedown", e => {
            if (container.contains(e.target as Node)) return;
            if (context_menu_ref?.current?.contains(e.target as Node)) return;
            is_opening.set(false);
            is_palette_opening.set(false);
            const input = input_ref.current;
            if (!input) return;
            set_color(rgba_to_code(...code_to_rgba(input.value)))
        })
    }, [])

    const is_palette_opening = new State(useState(false));
    const user_data = new State(useRecoilState(user_data_state));

    const set_context_menu_open = useSetRecoilState(is_context_menu_open_state);
    const set_context_menu_position = useSetRecoilState(context_menu_position_state);
    const set_context_menu_contents = useSetRecoilState(context_menu_contents_state);

    const [context_menu_ref, _set_context_menu_ref] = useRecoilState(context_menu_ref_state);

    return (
        <div className="common_color_picker_container" ref={container_ref}>
            <div
                className="common_color_picker_thumbnail"
                onClick={() => {
                    is_opening.set(b => !b);
                    is_palette_opening.set(false);
                }}
                style={{
                    backgroundColor: color,
                    width: width,
                    height: height
                }}
            />
            {is_opening.val_local() ?
                <div className="common_color_picker_main" style={{ top: height, }}>
                    <div className="common_color_picker_flex">
                        <div className="common_color_picker_mode" onClick={() => {
                            // model.set(({ "RGBA": "HSVA", "HSVA": "HSLA", "HSLA": "RGBA", } as const)[model.val()])
                            model.set(({ "RGBA": "RGBA", } as const)[model.val_local()])
                        }}>{model.val_local()}</div>
                        <div
                            className="common_color_picker_palette_icon"
                            onClick={() => { is_palette_opening.set(_ => !_); }}
                        >
                            <Palette size={24} />
                        </div>
                    </div>
                    <div className="common_color_picker_sliders">
                        <SliderWithBox setter={set_rgba_r} val={rgba_r} background={`linear-gradient(to right, ${rgba_to_code(0, rgba_g, rgba_b, rgba_a)}, ${rgba_to_code(255, rgba_g, rgba_b, rgba_a)})`} max={255} box_width={40} />
                        <SliderWithBox setter={set_rgba_g} val={rgba_g} background={`linear-gradient(to right, ${rgba_to_code(rgba_r, 0, rgba_b, rgba_a)}, ${rgba_to_code(rgba_r, 255, rgba_b, rgba_a)})`} max={255} box_width={40} />
                        <SliderWithBox setter={set_rgba_b} val={rgba_b} background={`linear-gradient(to right, ${rgba_to_code(rgba_r, rgba_g, 0, rgba_a)}, ${rgba_to_code(rgba_r, rgba_g, 255, rgba_a)})`} max={255} box_width={40} />
                        <SliderWithBox setter={set_rgba_a} val={rgba_a} background={`linear-gradient(to right, ${rgba_to_code(rgba_r, rgba_g, rgba_b, 0)}, ${rgba_to_code(rgba_r, rgba_g, rgba_b, 255)})`} max={255} box_width={40} />
                    </div>
                    <input
                        ref={input_ref}
                        type="text"
                        className="common_color_picker_box"
                        onBlur={e => {
                            set_color(rgba_to_code(...code_to_rgba((e.target as unknown as HTMLInputElement).value)))
                        }}
                        defaultValue={color}
                    ></input>
                </div>
                : ""}
            {is_palette_opening.val_local() ?
                <div className="common_color_picker_palette" style={{ top: height }}>
                    {user_data.val_local().unwrap().palette.map(({ code, uuid }) => {
                        return (<div
                            key={uuid}
                            className="common_color_picker_palette_color_button has_own_context_menu"
                            style={{
                                backgroundColor: code,
                            }}
                            onContextMenu={e => {
                                if ((e.target as HTMLElement).classList.contains("has_own_context_menu") && e.target !== e.currentTarget) return;
                                e.preventDefault();
                                if (context_menu_ref && context_menu_ref.current!.contains(e.target as Node)) return;
                                set_context_menu_open(_ => !_);
                                set_context_menu_position({ x: e.clientX, y: e.clientY });
                                set_context_menu_contents([
                                    <div className="context_menu_content" onClick={() => {
                                        user_data.set(Option.Some({
                                            palette: user_data.val_local().unwrap().palette.filter(
                                                ({ uuid: uuid2 }) => uuid2 != uuid
                                            )
                                        }));
                                    }}>削除</div>,
                                ]);
                            }}
                        />)
                    })}
                    <div
                        className="common_color_picker_palette_add_button"
                        onClick={() => {
                            user_data.set(user_data => Option.Some({
                                palette: [...user_data.unwrap().palette, { code: color, uuid: crypto.randomUUID() }]
                            }));
                        }}
                    ><Plus size={24} /></div>
                </div> : ""
            }
        </div >
    )
}

// const color_models = ["RGBA", "HSVA", "HSLA"] as const;
const color_models = ["RGBA"] as const;

const to_hx = (n: number) => n.toString(16);
const from_hx = (s: string) => parseInt(s, 16);

export const rgba_to_code = (r: number, g: number, b: number, a: number): string =>
    `#${('00' + to_hx(r)).slice(-2)}${('00' + to_hx(g)).slice(-2)}${('00' + to_hx(b)).slice(-2)}${('00' + to_hx(a)).slice(-2)}`

export const code_to_rgba = (c: string): [number, number, number, number] => {
    let d = c[0] === "#" ? c.substring(1, c.length) : c;
    while (d.length < 3) d = `0${d}`;
    if (d.length == 3) {
        d = `${d}f`
    }
    if (d.length == 4) {
        d = `${d[0]}${d[0]}${d[1]}${d[1]}${d[2]}${d[2]}${d[3]}${d[3]}`;
    }
    while (d.length < 6) d = `0${d}`;
    if (d.length == 6) {
        d = `${d}ff`
    }
    while (d.length < 8) d = `0${d}`;
    if (8 < d.length) d = d.substring(0, 8);
    return [
        from_hx(d.substring(0, 2)) || 0,
        from_hx(d.substring(2, 4)) || 0,
        from_hx(d.substring(4, 6)) || 0,
        from_hx(d.substring(6, 8)) || 0,
    ]
}

// const rgba_to_hsva = (rgba: [number, number, number, number]): [number, number, number, number] => {
//     const [r, g, b, a] = rgba.map(c => c / 255);
//     const max = Math.max(r, g, b);
//     const min = Math.min(r, g, b);
//     const delta = max - min;
//
//     let h = 0;
//     if (delta === 0) {
//         h = 0; // Hue is undefined
//     } else if (max === r) {
//         h = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
//     } else if (max === g) {
//         h = ((b - r) / delta + 2) * 60;
//     } else {
//         h = ((r - g) / delta + 4) * 60;
//     }
//
//     const s = max === 0 ? 0 : (delta / max) * 100;
//     const v = max * 100;
//
//     return [Math.round(h), Math.round(s), Math.round(v), Math.round(a * 255)];
// };
//
// const rgba_to_hsba = (rgba: [number, number, number, number]): [number, number, number, number] => {
//     const hsva = rgba_to_hsva(rgba);
//     return [hsva[0], hsva[1], hsva[2], hsva[3]];
// };
//
// const hsva_to_rgba = (hsva: [number, number, number, number]): [number, number, number, number] => {
//     const [h, s, v, a] = hsva;
//     const c = (v / 100) * (s / 100);
//     const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
//     const m = (v / 100) - c;
//
//     let r = 0, g = 0, b = 0;
//
//     if (h < 60) {
//         r = c; g = x; b = 0;
//     } else if (h < 120) {
//         r = x; g = c; b = 0;
//     } else if (h < 180) {
//         r = 0; g = c; b = x;
//     } else if (h < 240) {
//         r = 0; g = x; b = c;
//     } else if (h < 300) {
//         r = x; g = 0; b = c;
//     } else {
//         r = c; g = 0; b = x;
//     }
//
//     return [
//         Math.round((r + m) * 255),
//         Math.round((g + m) * 255),
//         Math.round((b + m) * 255),
//         Math.round(a) // Alpha remains the same
//     ];
// };
//
// const hsba_to_rgba = (hsba: [number, number, number, number]): [number, number, number, number] => {
//     return hsva_to_rgba([hsba[0], hsba[1], hsba[2], hsba[3]]);
// };
// 