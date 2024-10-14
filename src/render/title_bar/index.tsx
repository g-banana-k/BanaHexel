import "./index.css";
import { Hexagon } from "lucide-react";
import { MenuBar } from "./menu_bar";
import { WindowControl } from "./window_control";
import { atom, useAtom, useAtomValue } from "jotai";
import { State } from "../../logic/utils";
import { getCurrentWindow as appWindow } from "@tauri-apps/api/window";
import { ThemeToggleSwitch } from "./color_theme";
import { file_save_state_atom } from "../../window";


export const TitleBar = (props: { is_loading?: boolean }) => {
    const file_state = new State(useAtom(file_save_state_atom));
    appWindow().setTitle(`${file_state.val_local().path.unwrap_or("新規プロジェクト").split("/").at(-1)?.split("\\").at(-1)!} - BanaHexel`)
    return (
        <div id="title_bar_container">
            <div id="title_bar_app_icon" ><Hexagon size="16" /></div>
            {props.is_loading ? "" : <MenuBar />}
            <div data-tauri-drag-region className="title_bar_flex_space">
                <div data-tauri-drag-region id="title_bar_save_state">
                    {file_state.val_local().path.unwrap_or("新規プロジェクト").split("/").at(-1)?.split("\\").at(-1)} - {
                        file_state.val_global().saving ? "保存中" :
                            file_state.val_local().saved ? "保存済み" :
                                "未保存"
                    }
                </div>
            </div>
            <ThemeToggleSwitch />
            <WindowControl />
        </div>
    )
}