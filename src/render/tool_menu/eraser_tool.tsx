import { useAtom } from "jotai";
import "./index.css";
import { brush_tool_color_atom, eraser_tool_thickness_atom } from ".";
import { SliderWithBox } from "../color_picker/slider";
import { ColorPicker } from "../color_picker/color_picker";

export const EraserToolMenu = () => {
    const [brush_color, set_brush_color] = useAtom(brush_tool_color_atom);
    const [eraser_thickness, set_eraser_thickness] = useAtom(eraser_tool_thickness_atom);
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


