import "./index.css";
import { Hexagon } from "lucide-react";
import { MenuBar } from "./menu_bar";
import { WindowControl } from "./window_control";

export const TitleBar = (props: { is_loading?: boolean }) => {
    return (
        <div id="title_bar">
            <div id="title_bar_app_icon" ><Hexagon size="16" /></div>
            {props.is_loading ? "" : <MenuBar />}
            <div data-tauri-drag-region className="title_bar_flex_space"></div>
            <WindowControl />
        </div>
    )
}