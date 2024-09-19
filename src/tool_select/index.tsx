import { Brush, Circle, Eraser, PaintBucket, Slash, Square, SquareDashedMousePointer } from "lucide-react";
import "./index.css";

export const ToolSelect = () => <div id="tool_select_outer">
    <div id="tool_select">
        <div className="tool_icon" id="brush_tool_icon"><Brush size="26px" /></div>
        <div className="tool_icon" id="eraser_tool_icon"><Eraser size="26px" /></div>
        <div className="tool_icon" id="bucket_tool_icon"><PaintBucket size="26px" /></div>
        <div className="tool_icon" id="select_tool_icon"><SquareDashedMousePointer size="26px" /></div>
        <div className="tool_icon" id="rect_tool_icon"><Square size="26px" /></div>
        <div className="tool_icon" id="circle_tool_icon"><Circle size="26px" /></div>
        <div className="tool_icon" id="line_tool_icon"><Slash size="26px" /></div>
    </div>
</div>
