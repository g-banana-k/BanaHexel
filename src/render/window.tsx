import { atom, useSetRecoilState } from "recoil"
import { App } from "./app"
import { TitleBar } from "./title_bar"
import "./window.css"

export const window_size_atom = atom({
    key: "window_size",
    default: { width: 0, height: 0, maximized: false, minimized: false },
})

export const Window = () => {
    return (
        <div id="window">
            <TitleBar />
            <App />
        </div>
    )
}