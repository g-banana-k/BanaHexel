import { Brush, Eraser, PaintBucket, Slash, Square, SquareDashedMousePointer, Stamp } from "lucide-react";
import "./index.css";
import { Dispatch, ReactNode, SetStateAction } from "react";
import { atom, useRecoilState, useRecoilValue } from "recoil";
import { canvas_toolsT } from "../canvas_area";
import { is_mouse_down_in_editor_atom } from "../../logic/canvas_area/editor";

export const selected_tool_id_atom = atom<canvas_toolsT>({
    key: "selected_tool",
    default: "none",
})

export const ToolSelect = () => {
    const [selected_id, set_selected_id] = useRecoilState(selected_tool_id_atom);
    return (
        <div id="tool_select_outer">
            <div id="tool_select">
                <ToolIcon selected={selected_id} set_selected={set_selected_id} tool_id="brush_tool" ><Brush size="26px" /></ToolIcon>
                <ToolIcon selected={selected_id} set_selected={set_selected_id} tool_id="line_tool"  ><Slash size="26px" /></ToolIcon>
                <ToolIcon selected={selected_id} set_selected={set_selected_id} tool_id="eraser_tool"><Eraser size="26px" /></ToolIcon>
                <ToolIcon selected={selected_id} set_selected={set_selected_id} tool_id="bucket_tool"><PaintBucket size="26px" /></ToolIcon>
                <ToolIcon selected={selected_id} set_selected={set_selected_id} tool_id="stamp_tool"><Stamp size="26px" /></ToolIcon>
                <ToolIcon selected={selected_id} set_selected={set_selected_id} tool_id="select_tool"><SquareDashedMousePointer size="26px" /></ToolIcon>
                <ToolIcon selected={selected_id} set_selected={set_selected_id} tool_id="rect_tool"  ><Square size="26px" /></ToolIcon>
            </div>
        </div>
    )
}

const ToolIcon = (props: { tool_id: canvas_toolsT, children: ReactNode, selected: canvas_toolsT, set_selected: Dispatch<SetStateAction<canvas_toolsT>> }) => {
    const is_mouse_down_in_editor = useRecoilValue(is_mouse_down_in_editor_atom);
    return (
        <div
            className={`tool_icon ${props.selected == props.tool_id ? "selected_tool_icon" : ""}`}
            id={`${props.tool_id}_icon`}
            onClick={() => {
                if (is_mouse_down_in_editor) return;
                if (props.tool_id == props.selected) { props.set_selected("none") } else { props.set_selected(props.tool_id) }
            }}
        >{props.children}
        </div>
    )
}
