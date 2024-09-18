import { invoke } from "@tauri-apps/api/tauri";
import { appWindow } from "@tauri-apps/api/window";
import { Dispatch, ReactNode, SetStateAction, useEffect, useRef, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { canvas_size_state, is_loading_state, layer_arr_state, open_and_load_file } from "../App";
import { open_file, save_file } from "../data";

export const MenuBar = () => {
    const menu_bar_ref = useRef<HTMLDivElement>(null);
    const [selected, set_selected] = useState(-1);
    const layer_arr = useRecoilValue(layer_arr_state)!;
    const canvas_size = useRecoilValue(canvas_size_state)!;

    const set_loading = useSetRecoilState(is_loading_state);
    const set_layer_arr = useSetRecoilState(layer_arr_state);
    const set_canvas_size = useSetRecoilState(canvas_size_state);

    document.addEventListener("mousedown", e => {
        if (!menu_bar_ref.current) return;
        if (menu_bar_ref.current.contains(e.target as unknown as Node)) return;
        set_selected(-1)
    });
    return (
        <div ref={menu_bar_ref} id="title_bar_menu_bar">
            <MenuButton label="ファイル" id="title_bar_menu_file_button" nth={0} selected={selected} set_selected={set_selected}>
                <MenuContent on_click={() => {
                    save_file({ layers: layer_arr!.map((v) => v.body), meta_data: { canvas_size } });
                }} >名前を付けて保存</MenuContent>
                <MenuContent on_click={async () => {
                    const new_data = (await open_file()).unwrap();
                    new_data.on_some(v => {
                        set_loading(true);
                        open_and_load_file(v, { set_loading, set_layer_arr, set_canvas_size });
                    })
                }} >開く</MenuContent>
            </MenuButton>
            <MenuButton label="ヘルプ" id="title_bar_menu_help_button" nth={1} selected={selected} set_selected={set_selected}>
                <MenuContent ><a href="https://bananahexagon.github.io" target="_blank">ホームページ</a></MenuContent>
                <MenuContent on_click={() => { invoke("open_devtools", { window: appWindow }) }} >開発者ツール</MenuContent>
            </MenuButton>
        </div >
    )
}

const MenuButton = (props: { label: string, id: string, nth: number, selected: number, set_selected: Dispatch<SetStateAction<number>>, children: ReactNode }) => {
    const label_ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const label = label_ref.current
        if (!label) return;
        label.onmousedown = () => props.set_selected(selected => selected === props.nth ? -1 : props.nth);
        label.onmouseover = () => props.set_selected(selected => selected === -1 ? -1 : props.nth);
    }, [label_ref])
    return (
        <div className="title_bar_menu_button" id={props.id} >
            <div className={`title_bar_menu_button_label ${props.nth === props.selected ? "title_bar_menu_button_label_opened" : ""}`} ref={label_ref}>{props.label}</div>
            <div className={`title_bar_menu_contents ${props.nth === props.selected ? "title_bar_menu_contents_opened" : ""}`}>{props.children}</div>
        </div>
    )
}

const MenuContent = (props: { children: ReactNode, on_click?: () => void }) => {
    return (
        <div className="title_bar_menu_content" onClick={props.on_click}>{props.children}</div>
    )
}
