import { useState } from "react";
import { SliderWithBox } from "../common";
import "./brush_tool.css";
import { atom, useRecoilState } from "recoil";

export const brush_tool_color_state = atom({
    key: "brush_tool_color_state",
    default: "#000000ff"
})

export const BrushToolMenu = () => {
    const [brush_color, set_brush_color] = useRecoilState(brush_tool_color_state);
    const [rgba_r, set_rgba_r] = useState(from_hx(brush_color.substring(1, 3)));
    const [rgba_g, set_rgba_g] = useState(from_hx(brush_color.substring(3, 5)));
    const [rgba_b, set_rgba_b] = useState(from_hx(brush_color.substring(5, 7)));
    const [rgba_a, set_rgba_a] = useState(from_hx(brush_color.substring(7, 9)));
    set_brush_color(rgba(rgba_r, rgba_g, rgba_b, rgba_a))
    return (<div id="brush_tool_menu">
        <div id="brush_tool_menu_flex_1">
            <SliderWithBox setter={set_rgba_r} val={rgba_r} background={`linear-gradient(to right, ${rgba(0, rgba_g, rgba_b, rgba_a)}, ${rgba(255, rgba_g, rgba_b, rgba_a)})`} max={255} box_width={40} />
            <SliderWithBox setter={set_rgba_g} val={rgba_g} background={`linear-gradient(to right, ${rgba(rgba_r, 0, rgba_b, rgba_a)}, ${rgba(rgba_r, 255, rgba_b, rgba_a)})`} max={255} box_width={40} />
            <SliderWithBox setter={set_rgba_b} val={rgba_b} background={`linear-gradient(to right, ${rgba(rgba_r, rgba_g, 0, rgba_a)}, ${rgba(rgba_r, rgba_g, 255, rgba_a)})`} max={255} box_width={40} />
            <SliderWithBox setter={set_rgba_a} val={rgba_a} background={`linear-gradient(to right, ${rgba(rgba_r, rgba_g, rgba_b, 0)}, ${rgba(rgba_r, rgba_g, rgba_b, 255)})`} max={255} box_width={40} />
        </div>
    </div>)
}

const to_hx = (n: number) => n.toString(16);
const from_hx = (s: string) => parseInt(s, 16);

const rgba = (r: number, g: number, b: number, a: number): string =>
    `#${('00' + to_hx(r)).slice(-2)}${('00' + to_hx(g)).slice(-2)}${('00' + to_hx(b)).slice(-2)}${('00' + to_hx(a)).slice(-2)}`