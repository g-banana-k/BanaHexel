import "./index.css";
import { Hexagon, Maximize, Minimize, Minus, X } from "lucide-preact";
import { MenuBar } from "./menu_bar";
import { appWindow } from "@tauri-apps/api/window";

const window_close = () => { appWindow.close() };

const window_maximize = () => { appWindow.maximize() };
const window_unmaximize = () => { appWindow.unmaximize() };
const window_minimize = () => { appWindow.minimize() };

export const TitleBar = (props: { is_maximized: boolean, is_loading?: boolean }) => {
    return (
        <div id="title_bar">
            <div id="title_bar_app_icon" ><Hexagon size="16" /></div>
            {props.is_loading ? "" : <MenuBar />}
            <div data-tauri-drag-region class="title_bar_flex_space"></div>
            <WindowControl is_maximized={props.is_maximized} />
        </div>
    )
}

const WindowControl = (props: { is_maximized: boolean }) => {
    return (
        <div id="title_bar_window_control">
            <div id="minimize_button" class="title_bar_window_button" onClick={window_minimize}>
                <Minus size="16" />
            </div>
            <div id="maximize_button" class="title_bar_window_button" onClick={props.is_maximized ? window_unmaximize : window_maximize}>
                {props.is_maximized ? <Minimize size="16" /> : <Maximize size="16" />}
            </div>
            <div id="close_button" class="title_bar_window_button" onClick={window_close}>
                <X size="16" />
            </div>
        </div>
    )
}
