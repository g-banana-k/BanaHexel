import "./index.css";
import { Hexagon, Maximize, Minimize, Minus, X } from "lucide-react";
import { MenuBar } from "./menu_bar";
import { appWindow } from "@tauri-apps/api/window";
import { WindowControl } from "./window_control";

const window_close = () => { appWindow.close() };

const window_maximize = () => { appWindow.maximize() };
const window_unmaximize = () => { appWindow.unmaximize() };
const window_minimize = () => { appWindow.minimize() };

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