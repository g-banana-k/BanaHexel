import "./index.css"

import { atom, useRecoilState, useSetRecoilState } from "recoil";
import { file_save_state, TitleBar } from "./title_bar";
import { useEffect, useRef } from "react";
import { appWindow } from "@tauri-apps/api/window";
import App from "./app";
import { context_menu_contents_state, context_menu_position_state, context_menu_ref_state, ContextMenu, is_context_menu_open_state } from "./context_menu";
import { is_modal_open_state, Modal, modal_contents_state, modal_size_state } from "./modal";
import { listen } from "@tauri-apps/api/event";
import { State } from "./common/utils";
import { dialog } from "@tauri-apps/api";

listen("confirm_close", () => {
    document.dispatchEvent(new Event("close_requested"))
})

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
    const file_state = new State(useRecoilState(file_save_state));

    useEffect(() => {
        appWindow.onResized(async (_) => {
            set_window_size({
                w: window.innerWidth,
                h: window.innerHeight,
                maximized: await appWindow.isMaximized(),
                minimized: await appWindow.isMinimized(),
            })
        })
        document.addEventListener("keydown", e => {
            if (e.key === "F12") {
                e.preventDefault();
            }
        })
        document.addEventListener("close_requested", async () => {
            if (!file_state.val_global().saved) {
                const b = await dialog.confirm("本当に離れていいですか？\n保存していない変更は失われます。", {
                    "okLabel": "離れる",
                    "cancelLabel": "戻る",
                    "type": "warning",
                })
                if (!b) return;
            }
            appWindow.close()
        })
    }, [])

    const set_context_menu_open = useSetRecoilState(is_context_menu_open_state);
    const set_context_menu_position = useSetRecoilState(context_menu_position_state);
    const set_context_menu_contents = useSetRecoilState(context_menu_contents_state);

    const [context_menu_ref, set_context_menu_ref] = useRecoilState(context_menu_ref_state)
    return (
        <div id="window" onContextMenu={e => {
            if ((e.target as HTMLElement).classList.contains("has_own_context_menu") && e.target !== e.currentTarget) return;
            e.preventDefault();
            if (context_menu_ref && context_menu_ref.current!.contains(e.target as Node)) return;
            set_context_menu_open(_ => !_);
            set_context_menu_position({ x: e.clientX, y: e.clientY });
            set_context_menu_contents([
                <div className="context_menu_content">知らぬが仏</div>
            ]);
        }}>
            <TitleBar />
            <App />
            <ContextMenu />
            <Modal />
        </div>
    )
}