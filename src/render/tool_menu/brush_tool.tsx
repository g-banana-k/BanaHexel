import { useAtom } from "jotai";
import "./index.css";
import { brush_tool_color_atom, brush_tool_thickness_atom } from ".";
import { SliderWithBox } from "../color_picker/slider";
import { ColorPicker } from "../color_picker/color_picker";

export const BrushToolMenu = () => {
    const [brush_color, set_brush_color] = useAtom(brush_tool_color_atom);
    const [brush_thickness, set_brush_thickness] = useAtom(brush_tool_thickness_atom);
    return (<div className="tool_menu_brush">
        <div className="tool_menu_brush_color">
            <div className="tool_menu_brush_color_text">塗りつぶし</div>
            <ColorPicker
                color={brush_color}
                set_color={set_brush_color}
            />
        </div>
        <div className="tool_menu_brush_thickness"><SliderWithBox setter={set_brush_thickness} val={brush_thickness} width={99} min={1} /></div>
    </div>
    )
}


