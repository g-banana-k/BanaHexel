import "./index.css";
import { Hexagon } from "lucide-react";
import { MenuBar } from "./menu_bar";
import { WindowControl } from "./window_control";
import { atom, useRecoilState, useRecoilValue } from "recoil";
import { State } from "../common/utils";
import { opening_file_path_state } from "../app";
import { getCurrentWindow as appWindow } from "@tauri-apps/api/window";

export const file_save_state = atom({
    key: "file_save_state",
    default: {
        saving: false,
        saved: true,
        has_file: false,
    }
})

export const TitleBar = (props: { is_loading?: boolean }) => {
    const file_state = new State(useRecoilState(file_save_state));
    const opening_file_path = useRecoilValue(opening_file_path_state);
    appWindow().setTitle(`${opening_file_path.unwrap_or("新規プロジェクト").split("/").at(-1)?.split("\\").at(-1)!} - BanaHexel`)
    return (
        <div id="title_bar_container">
            <div id="title_bar_app_icon" ><Hexagon size="16" /></div>
            {props.is_loading ? "" : <MenuBar />}
            <div data-tauri-drag-region className="title_bar_flex_space">
                <div data-tauri-drag-region id="title_bar_save_state">
                    {opening_file_path.unwrap_or("新規プロジェクト").split("/").at(-1)?.split("\\").at(-1)} - {
                        file_state.val_global().saving ? "保存中" :
                            file_state.val_local().saved ? "保存済み" :
                                "未保存"
                    }
                </div>
            </div>
            <WindowControl />
        </div>
    )
}