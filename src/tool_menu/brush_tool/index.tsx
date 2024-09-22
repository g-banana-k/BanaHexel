import "./index.css";
import { ColorPicker } from "./color_picker"

export const BrushToolMenu = () => {
    return (<div id="brush_tool_menu">
        <div id="brush_tool_menu_flex_1">
            <ColorPicker />
        </div>
    </div>)
}