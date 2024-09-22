import { useRecoilState } from "recoil";
import "./index.css";
import { SliderWithBox } from "../common/slider";
import { ColorPicker } from "../common/color_picker";
import { brush_tool_color_state, brush_tool_thickness_state } from ".";

export const RectToolMenu = () => {
    const [brush_color, set_brush_color] = useRecoilState(brush_tool_color_state);
    const [brush_thickness, set_brush_thickness] = useRecoilState(brush_tool_thickness_state);
    return (<div className="tool_menu_brush">
        <div className="tool_menu_brush_color">
            <div className="tool_menu_brush_color_text">塗りつぶし</div>
            <ColorPicker
                color={brush_color}
                set_color={set_brush_color}
            />
        </div>
        <div className="tool_menu_brush_thickness"><SliderWithBox setter={set_brush_thickness} val={brush_thickness} width={99} min={1} background="#444" /></div>
    </div>
    )
}


