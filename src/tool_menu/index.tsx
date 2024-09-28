import { atom, useRecoilValue } from "recoil";
import "./index.css";
import { BrushToolMenu } from "./brush_tool";
import { selected_tool_id_state } from "../tool_select";
import { EraserToolMenu } from "./eraser_tool";
import { canvas_toolsT } from "../canvas_area";
import { SelectToolMenu } from "./select_tool";

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
    const tool_id = useRecoilValue(selected_tool_id_state);
    return (<div id="tool_menu">
        {({
            "brush_tool": < BrushToolMenu />,
            "eraser_tool": <EraserToolMenu />,
            "select_tool": <SelectToolMenu />
        } as Partial<{ [key in canvas_toolsT]: JSX.Element | string }>)[tool_id] ?? <BrushToolMenu />}
    </div>
    )
}