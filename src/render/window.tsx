import { App } from "./app"
import { TitleBar } from "./title_bar"
import "./window.css"

export const Window = () => {
    return (
        <div id="window">
            <TitleBar />
            <App />
        </div>
    )
}