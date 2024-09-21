import { Brush, Circle, Eraser, PaintBucket, Slash, Square, SquareDashedMousePointer } from "lucide-react";
import "./index.css";
import { Dispatch, ReactNode, SetStateAction } from "react";
import { atom, useRecoilState, useRecoilValue } from "recoil";
import { is_mouse_down_in_editor_state } from "../canvas_area/editor";

export const selected_tool_id_state = atom({
    key: "selected_tool_state",
    default: -1
})

export const ToolSelect = () => {
    const [selected_id, set_selected_id] = useRecoilState(selected_tool_id_state);
    return (
        <div id="tool_select_outer">
            <div id="tool_select">
                <ToolIcon nth={0} selected={selected_id} set_selected={set_selected_id} id="brush_tool_icon" ><Brush size="26px" /></ToolIcon>
                <ToolIcon nth={1} selected={selected_id} set_selected={set_selected_id} id="eraser_tool_icon"><Eraser size="26px" /></ToolIcon>
                <ToolIcon nth={2} selected={selected_id} set_selected={set_selected_id} id="bucket_tool_icon"><PaintBucket size="26px" /></ToolIcon>
                <ToolIcon nth={3} selected={selected_id} set_selected={set_selected_id} id="select_tool_icon"><SquareDashedMousePointer size="26px" /></ToolIcon>
                <ToolIcon nth={4} selected={selected_id} set_selected={set_selected_id} id="rect_tool_icon"  ><Square size="26px" /></ToolIcon>
                <ToolIcon nth={5} selected={selected_id} set_selected={set_selected_id} id="circle_tool_icon"><Circle size="26px" /></ToolIcon>
                <ToolIcon nth={6} selected={selected_id} set_selected={set_selected_id} id="line_tool_icon"  ><Slash size="26px" /></ToolIcon>
            </div>
        </div>
    )
}

const ToolIcon = (props: { id: string, children: ReactNode, nth: number, selected: number, set_selected: Dispatch<SetStateAction<number>> }) => {
    const is_mouse_down_in_editor = useRecoilValue(is_mouse_down_in_editor_state);
    return (
        <div
            className={`tool_icon ${props.selected == props.nth ? "selected_tool_icon" : ""}`}
            id={props.id}
            onClick={() => {
                if (is_mouse_down_in_editor) return;
                if (props.nth == props.selected) { props.set_selected(-1) } else { props.set_selected(props.nth) }
            }}
        >{props.children}
        </div>
    )
}
