import { useState } from "react";
import { SliderWithBox } from "./common";
import "./brush_tool.css";
import { atom, useRecoilState } from "recoil";

export const brush_tool_color_state = atom({
    key: "brush_tool_color_state",
    default: "#000000"
})

export const BrushToolMenu = () => {
    const [brush_color, set_brush_color] = useRecoilState(brush_tool_color_state);
    const [rgb_r, set_rgb_r] = useState(from_hx(brush_color.substring(1,3)));
    const [rgb_g, set_rgb_g] = useState(from_hx(brush_color.substring(3,5)));
    const [rgb_b, set_rgb_b] = useState(from_hx(brush_color.substring(5,7)));
    set_brush_color(rgb(rgb_r, rgb_g, rgb_b))
    return (<div id="brush_tool_menu">
        <div id="brush_tool_menu_flex_1">
            <SliderWithBox setter={set_rgb_r} val={rgb_r} background={`linear-gradient(to right, ${rgb(0, rgb_g, rgb_b)}, ${rgb(255, rgb_g, rgb_b)})`} max={255} box_width={40} />
            <SliderWithBox setter={set_rgb_g} val={rgb_g} background={`linear-gradient(to right, ${rgb(rgb_r, 0, rgb_b)}, ${rgb(rgb_r, 255, rgb_b)})`} max={255} box_width={40} />
            <SliderWithBox setter={set_rgb_b} val={rgb_b} background={`linear-gradient(to right, ${rgb(rgb_r, rgb_g, 0)}, ${rgb(rgb_r, rgb_g, 255)})`} max={255} box_width={40} />
        </div>
    </div>)
}

const to_hx = (n: number) => n.toString(16);
const from_hx = (s: string) => parseInt(s, 16);

const rgb = (r: number, g: number, b: number): string =>
    `#${('00' + to_hx(r)).slice(-2)}${('00' + to_hx(g)).slice(-2)}${('00' + to_hx(b)).slice(-2)}`