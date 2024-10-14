import "./window_control.css"

import { getCurrentWindow } from "@tauri-apps/api/window";
import { Maximize, Minimize, Minus, X } from "lucide-react";
import { useRecoilState } from "recoil";
import { window_size_atom } from "../window";

export const WindowControl = () => {
    const [window_size, set_window_size] = useRecoilState(window_size_atom);
    return (<div id="window_control">
        <div className="button minimize" onClick={minimize}        >
            <Minus size={16} />
        </div>
        <div className="button maximize" onClick={window_size.maximized ? unmaximize : maximize}        >
            {window_size.maximized ? <Minimize size={16} /> : <Maximize size={16} />}
        </div>
        <div className="button close" onClick={close}        >
            <X size={16} />
        </div>
    </div>)
}


const close = () => { document.dispatchEvent(new Event("close_requested")) };
const maximize = () => { getCurrentWindow().maximize() };
const unmaximize = () => { getCurrentWindow().unmaximize() };
const minimize = () => { getCurrentWindow().minimize() };