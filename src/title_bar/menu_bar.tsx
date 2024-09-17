import { invoke } from "@tauri-apps/api/tauri";
import { appWindow } from "@tauri-apps/api/window";
import { ReactNode } from "preact/compat";
import { Dispatch, StateUpdater, useEffect, useRef, useState } from "preact/hooks";

export const MenuBar = () => {
    const menu_bar_ref = useRef<HTMLDivElement>(null);
    const [selected, set_selected] = useState(-1);
    document.addEventListener("mousedown", e => {
        if (!menu_bar_ref.current) return;
        if (menu_bar_ref.current.contains(e.target as unknown as Node)) return;
        set_selected(-1)
    });
    return (
        <div ref={menu_bar_ref} id="title_bar_menu_bar">
            <MenuButton label="ファイル" id="title_bar_menu_file_button" nth={0} selected={selected} set_selected={set_selected}>
                <MenuContent on_click={() => { }} >保存</MenuContent>
                </MenuButton>
            <MenuButton label="ヘルプ" id="title_bar_menu_help_button" nth={1} selected={selected} set_selected={set_selected}>
                <MenuContent ><a href="https://bananahexagon.github.io" target="_blank">ホームページ</a></MenuContent>
                <MenuContent on_click={() => { invoke("open_devtools", {window: appWindow}) }} >開発者ツール</MenuContent>
            </MenuButton>
        </div>
    )
}

const MenuButton = (props: { label: string, id: string, nth: number, selected: number, set_selected: Dispatch<StateUpdater<number>>, children: ReactNode }) => {
    const label_ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const label = label_ref.current
        if (!label) return;
        label.onmousedown = () => props.set_selected(selected => selected === props.nth ? -1 : props.nth);
        label.onmouseover = () => props.set_selected(selected => selected === -1 ? -1 : props.nth);
    }, [label_ref])
    return (
        <div class="title_bar_menu_button" id={props.id} >
            <div class={`title_bar_menu_button_label ${props.nth === props.selected ? "title_bar_menu_button_label_opened" : ""}`} ref={label_ref}>{props.label}</div>
            <div class={`title_bar_menu_contents ${props.nth === props.selected ? "title_bar_menu_contents_opened" : ""}`}>{props.children}</div>
        </div>
    )
}

const MenuContent = (props: { children: ReactNode, on_click?: () => void }) => {
    return (
        <div class="title_bar_menu_content" onClick={props.on_click}>{props.children}</div>
    )
}
