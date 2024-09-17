import { ToolSelect } from "../tool_select"
import { ToolMenu } from "../tool_menu"
import { CanvasArea } from "../canvas_area"
import "./index.css"
import { layerT } from "../data"
import { ZoomInOut } from "../zoom_in_out"
import { useRef } from "react"

export const WorkSpace = () => {
    const zoom_reset_button_ref = useRef<HTMLDivElement>(null)

    return (<div id="work_space">
        <div id="work_space_row_flex_1">
            <ToolMenu />
        </div>
        <div id="work_space_row_flex_2">
            <ToolSelect />
            <CanvasArea />
        </div>
        <div id="work_space_row_flex_3">
            <div className="work_space_flex_space"></div>
            <ZoomInOut zoom_reset_button_ref={zoom_reset_button_ref} />
        </div>
    </div>
    )
}
