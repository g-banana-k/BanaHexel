import { atom, useRecoilState } from "recoil";
import { SliderWithBox } from "../../common/slider";

export const brush_tool_color_state = atom({
    key: "brush_tool_color_state",
    default: "#000000ff"
})

export const ColorPicker = () => {
    let [brush_color, set_brush_color] = useRecoilState(brush_tool_color_state);
    let rgba_r = from_hx(brush_color.substring(1, 3));
    let rgba_g = from_hx(brush_color.substring(3, 5));
    let rgba_b = from_hx(brush_color.substring(5, 7));
    let rgba_a = from_hx(brush_color.substring(7, 9));

    const set_rgba_r = (w: ((v: number) => number) | number) => {
        let u = 0;
        set_brush_color(_ => { u = from_hx(brush_color.substring(1, 3)); return _; });
        const v = typeof w === "number" ? w : (u);
        rgba_r = v;
        set_brush_color(rgba(rgba_r, rgba_g, rgba_b, rgba_a))
    }
    const set_rgba_g = (w: ((v: number) => number) | number) => {
        let u = 0;
        set_brush_color(_ => { u = from_hx(brush_color.substring(3, 5)); return _; });
        const v = typeof w === "number" ? w : (u);
        rgba_g = v;
        set_brush_color(rgba(rgba_r, rgba_g, rgba_b, rgba_a))
    }
    const set_rgba_b = (w: ((v: number) => number) | number) => {
        let u = 0;
        set_brush_color(_ => { u = from_hx(brush_color.substring(5, 7)); return _; });
        const v = typeof w === "number" ? w : (u);
        rgba_b = v;
        set_brush_color(rgba(rgba_r, rgba_g, rgba_b, rgba_a))
    }
    const set_rgba_a = (w: ((v: number) => number) | number) => {
        let u = 0;
        set_brush_color(_ => { u = from_hx(brush_color.substring(7, 9)); return _; });
        const v = typeof w === "number" ? w : (u);
        rgba_a = v;
        console.log(rgba_a);
        set_brush_color(rgba(rgba_r, rgba_g, rgba_b, rgba_a))
    }
    return (
        <div id="brush_tool_menu_color_picker">
            <SliderWithBox setter={set_rgba_r} val={rgba_r} background={`linear-gradient(to right, ${rgba(0, rgba_g, rgba_b, rgba_a)}, ${rgba(255, rgba_g, rgba_b, rgba_a)})`} max={255} box_width={40} />
            <SliderWithBox setter={set_rgba_g} val={rgba_g} background={`linear-gradient(to right, ${rgba(rgba_r, 0, rgba_b, rgba_a)}, ${rgba(rgba_r, 255, rgba_b, rgba_a)})`} max={255} box_width={40} />
            <SliderWithBox setter={set_rgba_b} val={rgba_b} background={`linear-gradient(to right, ${rgba(rgba_r, rgba_g, 0, rgba_a)}, ${rgba(rgba_r, rgba_g, 255, rgba_a)})`} max={255} box_width={40} />
            <SliderWithBox setter={set_rgba_a} val={rgba_a} background={`linear-gradient(to right, ${rgba(rgba_r, rgba_g, rgba_b, 0)}, ${rgba(rgba_r, rgba_g, rgba_b, 255)})`} max={255} box_width={40} />
        </div>
    )

}

const to_hx = (n: number) => n.toString(16);
const from_hx = (s: string) => parseInt(s, 16);

const rgba = (r: number, g: number, b: number, a: number): string =>
    `#${('00' + to_hx(r)).slice(-2)}${('00' + to_hx(g)).slice(-2)}${('00' + to_hx(b)).slice(-2)}${('00' + to_hx(a)).slice(-2)}`