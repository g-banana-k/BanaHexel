import "./help.css"

import { invoke } from "@tauri-apps/api/core";
import { menu_bar_selected_atom, MenuButton, MenuContent } from ".";
import { useSetModal } from "../../modal";
import { getTauriVersion } from "@tauri-apps/api/app";
import React from "react";
import { Info } from "lucide-react";
import { useAtom } from "jotai";

export const HelpMenuButton = () => {
    const [set_modal_contents, set_modal_size, set_modal_open] = useSetModal();
    let [selected, set_selected] = useAtom(menu_bar_selected_atom);
    return (
        <MenuButton label="ヘルプ" id="title_bar_menu_help_button" nth={1} selected={selected} set_selected={set_selected}>
            <a href="https://g-banana-k.github.io/banahexel_site" target="_blank"><MenuContent on_click={() => {
                set_selected(-1);
            }}>ホームページ</MenuContent></a>
            <MenuContent on_click={() => {
                set_selected(-1);
                invoke("open_devtools", { window: Window })
            }} >開発者ツール</MenuContent>
            <MenuContent on_click={() => {
                window.location.reload();
            }} >WebViewを再読み込み</MenuContent>
            <MenuContent on_click={async () => {
                set_selected(-1);
                set_modal_open(true);
                set_modal_size({ w: 500, h: 250 })
                set_modal_contents([
                    <div className="app_version_info_container">
                        <div className="app_version_info_icon">
                            <Info size={50} style={{
                            }} />
                        </div>
                        <div className="app_version_info_main">
                            <div className="app_version_info_title">BanaHexel</div>
                            <div>React: {React.version}</div>
                            <div>Tauri: {await getTauriVersion()}</div>
                            <div>WebView: {navigator.userAgent}</div>
                        </div>
                    </div>
                ])
            }} >バージョン情報</MenuContent>
        </MenuButton>
    )
}