import { useRecoilValue } from "recoil";
import "./index.css";
import { selected_tool_id_state } from "../tool_select";
import { BrushToolMenu } from "./brush_tool";

export const ToolMenu = () => {
    const tool_id = useRecoilValue(selected_tool_id_state)
    return (<div id="tool_menu">{
        ["", <BrushToolMenu />][tool_id+1]
    }</div>)
}
