import { useRecoilState } from "recoil";
import "./index.css";
import { brush_tool_color_atom, eraser_tool_thickness_atom } from ".";
import { SliderWithBox } from "../common/slider";
import { ColorPicker } from "../common/color_picker";

export const EraserToolMenu = () => {
    const [brush_color, set_brush_color] = useRecoilState(brush_tool_color_atom);
    const [eraser_thickness, set_eraser_thickness] = useRecoilState(eraser_tool_thickness_atom);
    return (<div className="tool_menu_eraser">
        <div className="tool_menu_brush_color">
            <div className="tool_menu_brush_color_text">塗りつぶし</div>
            <ColorPicker
                color={brush_color}
                set_color={set_brush_color}
            />
        </div>
        <div className="tool_menu_eraser_thickness"><SliderWithBox setter={set_eraser_thickness} val={eraser_thickness} width={99} min={1} /></div>
    </div>
    )
}


