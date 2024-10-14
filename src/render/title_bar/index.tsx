import "./index.css"
import { WindowControl } from "./window_control"

export const TitleBar = () => {
    return (
        <div data-tauri-drag-region id="title_bar">
            <div className="flex_space" />
            <WindowControl />
        </div>
    )
}