import { ToolSelect } from "../tool_select"
import { ToolMenu } from "../tool_menu"
import { CanvasArea } from "../canvas_area"
import "./index.css"
import { layerT } from "../data"
import { window_sizeT } from "../App"
import { ZoomInOut } from "../zoom_in_out"
import { useRef, useState } from "preact/hooks"

export const WorkSpace = (props: { layer_arr: layerT[], current_layer: number, set_layer_arr: (arg0: layerT[]) => void, window_size: window_sizeT }) => {
    const [zoom, set_zoom] = useState(1);
    const zoom_reset_button_ref = useRef<HTMLDivElement>(null)
    
    return (<div id="work_space">
        <div id="work_space_row_flex_1">
            <ToolMenu />
        </div>
        <div id="work_space_row_flex_2">
            <ToolSelect />
            <CanvasArea
                current_layer={props.current_layer}
                layer_arr={props.layer_arr}
                set_layer_arr={props.set_layer_arr}
                window_size={props.window_size}
                zoom={zoom}
                set_zoom={set_zoom}
                zoom_reset_button_ref={zoom_reset_button_ref}
            />
        </div>
        <div id="work_space_row_flex_3">
            <div class="work_space_flex_space"></div>
            <ZoomInOut zoom_reset_button_ref={zoom_reset_button_ref} zoom={zoom} set_zoom={set_zoom} />
        </div>
    </div>
    )
}
