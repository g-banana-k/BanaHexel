import { atom, useRecoilState, useRecoilValue } from "recoil";
import "./index.css";
import { BrushToolMenu } from "./brush_tool";
import { selected_tool_id_state } from "../tool_select";
import { EraserToolMenu } from "./eraser_tool";
import { LineToolMenu } from "./line_tool";
import { canvas_tools } from "../canvas_area";
import { RectToolMenu } from "./rect_tool";

export const brush_tool_color_state = atom({
    key: "brush_tool_color_state",
    default: "#000000ff"
})

export const brush_tool_thickness_state = atom({
    key: "brush_tool_thickness_state",
    default: 1
})

export const eraser_tool_thickness_state = atom({
    key: "eraser_tool_thickness_state",
    default: 1
})

export const ToolMenu = () => {
    const tool_id_raw = useRecoilValue(selected_tool_id_state);
    const tool_id = canvas_tools[tool_id_raw + 1];
    return (<div id="tool_menu">
        {{
            "none": "",
            "brush_tool": < BrushToolMenu />,
            "line_tool": <LineToolMenu />,
            "eraser_tool": <EraserToolMenu />,
            "rect_tool": <RectToolMenu />
        }[tool_id] ?? ""}
    </div>
    )
}