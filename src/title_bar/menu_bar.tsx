import { invoke } from "@tauri-apps/api/tauri";
import { appWindow, WebviewWindow } from "@tauri-apps/api/window";
import React, { Dispatch, ReactNode, SetStateAction, useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { canvas_size_state, current_layer_state, is_loading_state, layer_arr_state, load_file, opening_file_path_state } from "../app";
import { open_file, save_file_new, save_file_with_path } from "../file";
import { is_modal_open_state, modal_contents_state, modal_size_state } from "../modal";
import { Info } from "lucide-react";
import { getTauriVersion } from "@tauri-apps/api/app";
import { Option, PromiseWithResolvers, State } from "../common/utils";
import { file_save_state } from ".";
import { undo_stack } from "../canvas_area/undo";

export const MenuBar = () => {
    const menu_bar_ref = useRef<HTMLDivElement>(null);
    let [selected, set_selected] = useState(-1);
    const layer_arr = useRecoilValue(layer_arr_state)!;
    const canvas_size = useRecoilValue(canvas_size_state)!;
    const file_state = new State(useRecoilState(file_save_state));

    const set_loading = useSetRecoilState(is_loading_state);
    const set_layer_arr = useSetRecoilState(layer_arr_state);
    const set_canvas_size = useSetRecoilState(canvas_size_state);
    const set_current_layer = useSetRecoilState(current_layer_state);
    const [opening_file_path, set_opening_file_path] = useRecoilState(opening_file_path_state);

    const set_modal_open = useSetRecoilState(is_modal_open_state);
    const set_modal_contents = useSetRecoilState(modal_contents_state);
    const set_modal_size = useSetRecoilState(modal_size_state);

    document.addEventListener("mousedown", e => {
        if (!menu_bar_ref.current) return;
        if (menu_bar_ref.current.contains(e.target as unknown as Node)) return;
        set_selected(-1)
    });
    return (
        <div ref={menu_bar_ref} id="title_bar_menu_bar">
            <MenuButton label="ファイル" id="title_bar_menu_file_button" nth={0} selected={selected} set_selected={set_selected}>
                <MenuContent on_click={async () => {
                    set_selected(-1);
                    const { promise, resolve } = PromiseWithResolvers<Option<{ w: number, h: number }>>();
                    let [w, h] = [NaN, NaN];
                    set_modal_open(true);
                    set_modal_size({ w: 500, h: 200 });
                    set_modal_contents([<div className="new_project_modal">
                        <div className="new_project_modal_title">
                            新規作成
                        </div>
                        <div className="new_project_modal_canvas_size">
                            <div className="new_project_modal_canvas_size_part">
                                <div className="new_project_modal_canvas_size_part_title">縦幅</div>
                                <input className="new_project_modal_text_box" type="number" min={1}
                                    onInput={e => { h = Number.parseInt(e.currentTarget.value!) }} />
                            </div>
                            <div className="new_project_modal_canvas_size_part">
                                <div className="new_project_modal_canvas_size_part_title">横幅</div>
                                <input className="new_project_modal_text_box" type="number" min={1}
                                    onInput={e => { w = Number.parseInt(e.currentTarget.value!) }} />
                            </div>
                        </div>
                        <div className="new_project_modal_confirm" onClick={() => {
                            resolve(Option.Some({ w, h }));
                            set_modal_open(false);
                        }} >作成</div>
                    </div>]);
                    document.addEventListener("modal_close", _ => {
                        resolve(Option.None())
                    }, { once: true });
                    (await promise).on_some(async ({ w, h }) => {
                        set_opening_file_path(Option.None());
                        undo_stack.clear();
                        const canvas_w = !Number.isNaN(w) ? w : 64;
                        const canvas_h = !Number.isNaN(h) ? h : 64;
                        set_loading(true)
                        await load_file({ meta_data: { canvas_size: { width: canvas_w, height: canvas_h } } }, {
                            set_layer_arr, set_canvas_size, set_loading, set_current_layer
                        });
                        set_loading(false)
                        file_state.set({ saving: false, saved: false })
                    });
                }} >新規作成</MenuContent>
                <MenuContent on_click={async () => {
                    set_selected(-1);
                    file_state.set({ saving: true, saved: false })
                    const p = await save_file_new({ layers: layer_arr!.map((v) => v.body), meta_data: { canvas_size } });
                    set_opening_file_path(Option.Some(p.split("/").at(-1)?.split("\\").at(-1)!))
                    file_state.set({ saving: false, saved: true })
                }} >名前を付けて保存</MenuContent>
                <MenuContent on_click={async () => {
                    set_selected(-1);
                    file_state.set({ saving: true, saved: false })
                    if (opening_file_path.is_some()) {
                        await save_file_with_path(opening_file_path.unwrap(), { layers: layer_arr!.map((v) => v.body), meta_data: { canvas_size } });
                    } else {
                        const p = await save_file_new({ layers: layer_arr!.map((v) => v.body), meta_data: { canvas_size } });
                        set_opening_file_path(Option.Some(p.split("/").at(-1)?.split("\\").at(-1)!))
                    }
                    file_state.set({ saving: false, saved: true })
                }} >上書き保存</MenuContent>
                <MenuContent on_click={async () => {
                    set_selected(-1);
                    const new_data = (await open_file()).unwrap();
                    new_data.on_some(async v => {
                        undo_stack.clear();
                        set_loading(true);
                        set_opening_file_path(Option.Some(v[0]));
                        await load_file(v[1], { set_loading, set_layer_arr, set_canvas_size, set_current_layer });
                        set_loading(false);
                        file_state.set({ saving: false, saved: true })
                    })
                }} >開く</MenuContent>
            </MenuButton>
            <MenuButton label="ヘルプ" id="title_bar_menu_help_button" nth={1} selected={selected} set_selected={set_selected}>
                <a href="https://bananahexagon.github.io" target="_blank"><MenuContent on_click={() => {
                    set_selected(-1);
                }}>ホームページ</MenuContent></a>
                <MenuContent on_click={() => {
                    set_selected(-1);
                    invoke("open_devtools", { window: appWindow })
                }} >開発者ツール</MenuContent>
                <MenuContent on_click={async () => {
                    set_selected(-1);
                    set_modal_open(true);
                    set_modal_size({ w: 500, h: 250 })
                    set_modal_contents([
                        <div style={{
                            marginTop: 25,
                            display: "flex",
                            flexDirection: "row",
                            fontSize: 13,
                            lineHeight: "26px",
                        }}><div style={{
                            marginRight: 20,
                            display: "block",
                        }}>
                                <Info size={50} style={{
                                }} />
                            </div>
                            <div style={{
                                flexGrow: 1,
                                marginRight: 20,
                            }}>
                                <div
                                    style={{
                                        height: 50,
                                        lineHeight: "50px",
                                        fontSize: 23,
                                    }}>
                                    BanaHexel
                                </div>
                                <div>
                                    React: {React.version}
                                </div>
                                <div>
                                    Tauri: {await getTauriVersion()}
                                </div>
                                <div>
                                    WebView: {navigator.userAgent}
                                </div>
                            </div>
                        </div>
                    ])
                }} >バージョン情報</MenuContent>
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
