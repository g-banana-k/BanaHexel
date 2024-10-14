import { atom, useAtomValue } from "jotai";
import "./index.css";
import { BrushToolMenu } from "./brush_tool";
import { EraserToolMenu } from "./eraser_tool";
import { canvas_toolsT } from "../canvas_area";
import { SelectToolMenu } from "./select_tool";
import { selected_tool_id_atom } from "../tool_select";

export const brush_tool_color_atom = atom("#000000ff")

export const brush_tool_thickness_atom = atom(1)

export const eraser_tool_thickness_atom = atom(1)

export const ToolMenu = () => {
    const tool_id = useAtomValue(selected_tool_id_atom);
    return (<div id="tool_menu">
        {({
            "brush_tool": < BrushToolMenu />,
            "eraser_tool": <EraserToolMenu />,
            "select_tool": <SelectToolMenu />
        } as Partial<{ [key in canvas_toolsT]: JSX.Element | string }>)[tool_id] ?? <BrushToolMenu />}
    </div>
    )
}