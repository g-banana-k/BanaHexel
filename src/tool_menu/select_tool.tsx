import { useRecoilState } from "recoil";
import "./index.css";
import { SliderWithBox } from "../common/slider";
import { ColorPicker } from "../common/color_picker";
import { brush_tool_color_state, brush_tool_thickness_state } from ".";
import { FlipHorizontal2, FlipVertical2, RotateCcwSquare, RotateCwSquare, Trash2 } from "lucide-react";

export const SelectToolMenu = () => {
    const [brush_color, set_brush_color] = useRecoilState(brush_tool_color_state);
    const [brush_thickness, set_brush_thickness] = useRecoilState(brush_tool_thickness_state);
    const dispatch = (s: "flip_vertical" | "flip_horizontal" | "rotate_l90" | "rotate_r90" | "trash") => document.dispatchEvent(new CustomEvent("select_area_event", { detail: s }))
    return (<div className="tool_menu_select">
        <div className="tool_menu_select_brush_part">
            <div className="tool_menu_brush_color">
                <div className="tool_menu_brush_color_text">塗りつぶし</div>
                <ColorPicker
                    color={brush_color}
                    set_color={set_brush_color}
                />
            </div>
            <div className="tool_menu_brush_thickness"><SliderWithBox setter={set_brush_thickness} val={brush_thickness} width={99} min={1} /></div>
        </div>
        <div className="tool_menu_select_edit_button" onClick={() => dispatch("flip_vertical")}>
            <FlipHorizontal2 />
        </div>
        <div className="tool_menu_select_edit_button" onClick={() => dispatch("flip_horizontal")}>
            <FlipVertical2 />
        </div>
        <div className="tool_menu_select_edit_button" onClick={() => dispatch("trash")}>
            <Trash2 />
        </div>
        <div className="tool_menu_select_edit_button" onClick={() => dispatch("rotate_r90")}>
            <RotateCwSquare />
        </div>
        <div className="tool_menu_select_edit_button" onClick={() => dispatch("rotate_l90")}>
            <RotateCcwSquare />
        </div>
    </div>)
}

declare global {
    interface DocumentEventMap {
        "select_area_event": CustomEvent<"flip_vertical" | "flip_horizontal" | "rotate_l90" | "rotate_r90" | "trash">;
    }
}