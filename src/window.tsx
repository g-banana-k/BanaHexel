import "./index.css"

import { atom, useRecoilState, useSetRecoilState } from "recoil";
import { file_save_state, TitleBar } from "./title_bar";
import { useEffect } from "react";
import { getCurrentWindow as appWindow } from "@tauri-apps/api/window";
import App, { canvas_size_state, layer_arr_state, opening_file_path_state, user_data_state } from "./app";
import { context_menu_contents_state, context_menu_position_state, context_menu_ref_state, ContextMenu, is_context_menu_open_state } from "./context_menu";
import { Modal } from "./modal";
import { listen } from "@tauri-apps/api/event";
import { Option, State } from "./common/utils";
import { read_user_data, save_file_with_path, write_user_data } from "./file";
import * as dialog from "@tauri-apps/plugin-dialog";

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
    const [_window_size, set_window_size] = useRecoilState(window_size_state);
    const file_state = new State(useRecoilState(file_save_state));
    const user_data = new State(useRecoilState(user_data_state));
    const opening_file_path = new State(useRecoilState(opening_file_path_state));
    const layer_arr = new State(useRecoilState(layer_arr_state));
    const canvas_size = new State(useRecoilState(canvas_size_state));

    useEffect(() => {
        appWindow().onResized(async (_) => {
            set_window_size({
                w: window.innerWidth,
                h: window.innerHeight,
                maximized: await appWindow().isMaximized(),
                minimized: await appWindow().isMinimized(),
            })
        });
        document.addEventListener("keydown", async e => {
            // if (e.key === "F12") {
            //     e.preventDefault();
            // }
            if (e.key === "s" && e.ctrlKey) {
                e.preventDefault();
                if (layer_arr.val_global() === undefined || canvas_size.val_global() === undefined) return;
                save_file_with_path({ file_state, opening_file_path, layer_arr: layer_arr.val_local()!, canvas_size: canvas_size.val_local()! })
                write_user_data({ user_data: user_data.val_global().unwrap() })
            }
        });
        document.addEventListener("close_requested", async () => {
            if (!file_state.val_global().saved && file_state.val_local().has_file) {
                const b = await dialog.confirm("本当に離れていいですか？\n保存していない変更は失われます。", {
                    "okLabel": "離れる",
                    "cancelLabel": "戻る",
                    "kind": "warning",
                })
                if (!b) return;
            };
            write_user_data({ user_data: user_data.val_global().unwrap() });
            appWindow().close()
        });
        (async () => {
            user_data.set(Option.Some(await read_user_data()));
        })()
    }, [])

    const set_context_menu_open = useSetRecoilState(is_context_menu_open_state);
    const set_context_menu_position = useSetRecoilState(context_menu_position_state);
    const set_context_menu_contents = useSetRecoilState(context_menu_contents_state);

    const [context_menu_ref, _set_context_menu_ref] = useRecoilState(context_menu_ref_state)
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