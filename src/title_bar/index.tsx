import "./index.css";
import { Hexagon, Maximize, Minimize, Minus, X } from "lucide-react";
import { MenuBar } from "./menu_bar";
import { appWindow } from "@tauri-apps/api/window";
import { useRecoilValue } from "recoil";
import { is_window_maximized_state } from "../App";

const window_close = () => { appWindow.close() };

const window_maximize = () => { appWindow.maximize() };
const window_unmaximize = () => { appWindow.unmaximize() };
const window_minimize = () => { appWindow.minimize() };

export const TitleBar = (props: { is_loading?: boolean }) => {
    const is_maximized = useRecoilValue(is_window_maximized_state);
    return (
        <div id="title_bar">
            <div id="title_bar_app_icon" ><Hexagon size="16" /></div>
            {props.is_loading ? "" : <MenuBar />}
            <div data-tauri-drag-region className="title_bar_flex_space"></div>
            <WindowControl is_maximized={is_maximized} />
        </div>
    )
}

const WindowControl = (props: { is_maximized: boolean }) => {
    return (
        <div id="title_bar_window_control">
            <div id="minimize_button" className="title_bar_window_button" onClick={window_minimize}>
                <Minus size="16" />
            </div>
            <div id="maximize_button" className="title_bar_window_button" onClick={props.is_maximized ? window_unmaximize : window_maximize}>
                {props.is_maximized ? <Minimize size="16" /> : <Maximize size="16" />}
            </div>
            <div id="close_button" className="title_bar_window_button" onClick={window_close}>
                <X size="16" />
            </div>
        </div>
    )
}
