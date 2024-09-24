import "./index.css"

import { atom, useRecoilState } from "recoil";
import { TitleBar } from "./title_bar";
import { useEffect } from "react";
import { appWindow } from "@tauri-apps/api/window";
import App from "./app";


export const window_size_state = atom({
    key: "window_size_state",
    default: {
        w: window.innerWidth,
        h: window.innerHeight,
        maximized: false,
        minimized: false
    }
})

export const Window = () => {
    const [window_size, set_window_size] = useRecoilState(window_size_state);

    useEffect(() => {
        appWindow.onResized(async (_) => {
            set_window_size({
                w: window.innerWidth,
                h: window.innerHeight,
                maximized: await appWindow.isMaximized(),
                minimized: await appWindow.isMinimized(),
            })
        })
    }, [])

    return (
        <div id="window" onContextMenu={e=> {
            
        }}>
            <TitleBar />
            <App />
        </div>
    )
}