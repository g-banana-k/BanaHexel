import { ToolSelect } from "../tool_select"
import { ToolMenu } from "../tool_menu"
import { CanvasArea } from "../canvas_area"
import "./index.css"
import { ZoomInOut } from "../zoom_in_out"
import { LayerOption } from "../layer_option"
import { useRef } from "react"
import { rgba_to_code } from "../../logic/color"

export const WorkSpace = () => {
    return (<div id="work_space" >
        <div id="work_space_row_flex_1">
            <ToolMenu />
        </div>
        <div id="work_space_row_flex_2">
            <ToolSelect />
            <CanvasArea />
        </div>
        <div id="work_space_row_flex_3">
            <div className="work_space_flex_space"></div>
            <LayerOption />
            <ZoomInOut />
        </div>
    </div>
    )
}
