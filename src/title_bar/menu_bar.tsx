import { invoke } from "@tauri-apps/api/core";
import { Window } from "@tauri-apps/api/window";
import React, { Dispatch, ReactNode, SetStateAction, useEffect, useRef, useState } from "react";
import { SetterOrUpdater, useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { canvas_size_state, current_layer_state, is_loading_state, layer_arr_state, load_file, opening_file_path_state, user_data_state } from "../app";
import { export_image, open_file, save_file_new, save_file_with_path, write_user_data } from "../file";
import { is_modal_open_state, modal_contents_state, modal_size_state } from "../modal";
import { Info } from "lucide-react";
import { getTauriVersion } from "@tauri-apps/api/app";
import { create_canvas, Option, PromiseWithResolvers, Result, State } from "../common/utils";
import { file_save_state } from ".";
import { undo_stack } from "../canvas_area/undo";
import { Layer } from "../data";

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
    const opening_file_path = new State(useRecoilState(opening_file_path_state));

    const set_modal_open = useSetRecoilState(is_modal_open_state);
    const set_modal_contents = useSetRecoilState(modal_contents_state);
    const set_modal_size = useSetRecoilState(modal_size_state);
    const user_data = useRecoilValue(user_data_state);

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
                                <input className="new_project_modal_text_box" type="number" defaultValue={64} min={1}
                                    onInput={e => {
                                        h = Math.max(1, Number.parseInt(e.currentTarget.value!));
                                        e.currentTarget.value = `${h}`;
                                    }} />
                            </div>
                            <div className="new_project_modal_canvas_size_part">
                                <div className="new_project_modal_canvas_size_part_title">横幅</div>
                                <input className="new_project_modal_text_box" type="number" defaultValue={64} min={1}
                                    onInput={e => {
                                        w = Math.max(1, Number.parseInt(e.currentTarget.value!));
                                        e.currentTarget.value = `${w}`;
                                    }} />
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
                        // opening_file_path.set(Option.None());
                        undo_stack.clear();
                        const canvas_w = !Number.isNaN(w) ? w : 64;
                        const canvas_h = !Number.isNaN(h) ? h : 64;
                        set_loading(true)
                        await load_file({ meta_data: { canvas_size: { width: canvas_w, height: canvas_h } } }, {
                            set_layer_arr, set_canvas_size, set_loading, set_current_layer
                        });
                        set_loading(false)
                        file_state.set({ saving: false, saved: false, has_file: false })
                    });
                }} >新規作成</MenuContent>
                <MenuContent on_click={async () => {
                    set_selected(-1);
                    save_file_new({
                        file_state,
                        canvas_size,
                        layer_arr: layer_arr,
                        opening_file_path: opening_file_path
                    })
                    write_user_data({ user_data: user_data.unwrap() })
                }} >名前を付けて保存</MenuContent>
                <MenuContent on_click={async () => {
                    set_selected(-1);
                    save_file_with_path({
                        file_state: file_state.as_state_by_setter(),
                        canvas_size,
                        layer_arr: layer_arr,
                        opening_file_path: opening_file_path.as_state_by_setter(),
                    })
                    write_user_data({ user_data: user_data.unwrap() })
                }} >上書き保存</MenuContent>
                <MenuContent on_click={async () => {
                    set_selected(-1);
                    open_file({
                        undo_stack,
                        set_loading,
                        set_layer_arr,
                        set_canvas_size,
                        set_current_layer,
                        opening_file_path: opening_file_path.as_state_by_setter(),
                        load_file,
                        file_state,
                    })
                    write_user_data({ user_data: user_data.unwrap() })
                }} >開く</MenuContent>
                <MenuContent on_click={project_export({
                    set_selected,
                    set_modal_open,
                    set_modal_size,
                    set_modal_contents,
                    canvas_size,
                    layer_arr,
                    opening_file_path,
                    canvas_handler: async ({ canvas, opening_file_path }) => {
                        export_image({
                            img: canvas,
                            project_name: opening_file_path.val_global().unwrap_or("新規プロジェクト").split("/").at(-1)?.split("\\").at(-1)!.replace(/^(.+)\..+$/, '$1'),
                        })
                    }
                })}>エクスポート</MenuContent>
                <MenuContent on_click={
                    project_export({
                        set_selected,
                        set_modal_open,
                        set_modal_size,
                        set_modal_contents,
                        canvas_size,
                        layer_arr,
                        opening_file_path,
                        canvas_handler: async ({ canvas }) => {
                            const data_url = canvas.toDataURL('image/png');
                            const blob = await (await fetch(data_url)).blob();
                            const clipboard_item = new ClipboardItem({
                                [blob.type]: blob
                            });
                            await Result.from_try_catch_async(async () => await navigator.clipboard.write([clipboard_item]));
                            URL.revokeObjectURL(data_url)
                        }
                    })
                }>クリップボードにエクスポート</MenuContent>
            </MenuButton>
            <MenuButton label="ヘルプ" id="title_bar_menu_help_button" nth={1} selected={selected} set_selected={set_selected}>
                <a href="https://bananahexagon.github.io/banahexel_site" target="_blank"><MenuContent on_click={() => {
                    set_selected(-1);
                }}>ホームページ</MenuContent></a>
                <MenuContent on_click={() => {
                    set_selected(-1);
                    invoke("open_devtools", { window: Window })
                }} >開発者ツール</MenuContent>
                {/* <MenuContent on_click={() => {
                    window.location.reload();
                }} >WebViewを再読み込み</MenuContent> */}
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

const project_export = ({
    set_selected,
    set_modal_open,
    set_modal_size,
    set_modal_contents,
    canvas_size,
    layer_arr,
    opening_file_path,
    canvas_handler
}: project_export_argsT & {
    canvas_handler: (args: project_export_argsT & { canvas: HTMLCanvasElement }) => Promise<void>;
}) => async () => {
    set_selected(-1);
    const { promise, resolve } = PromiseWithResolvers<Option<number>>();
    let r = NaN;
    set_modal_open(true);
    set_modal_size({ w: 500, h: 200 });
    set_modal_contents([<div className="image_export_modal">
        <div className="image_export_modal_title">
            エクスポート
        </div>
        <div className="image_export_modal_canvas_size">
            <div className="image_export_modal_canvas_size_part">
                <div className="image_export_modal_canvas_size_part_title">倍率</div>
                <input className="image_export_modal_text_box" type="number" defaultValue={100} min={1}
                    onInput={e => {
                        r = Math.max(1, Number.parseInt(e.currentTarget.value!))
                        e.currentTarget.value = `${r}`;
                    }} />%
            </div>
        </div>
        <div className="image_export_modal_confirm" onClick={() => {
            resolve(Option.Some(r / 100));
            set_modal_open(false);
        }} >エクスポート</div>
    </div>]);
    document.addEventListener("modal_close", _ => {
        resolve(Option.None())
    }, { once: true });
    (await promise).on_some(r_raw => {
        const r = Number.isNaN(r_raw) ? 1 : r_raw;
        const [canvas, ctx] = create_canvas({ width: canvas_size.width * r, height: canvas_size.height * r });
        ctx.imageSmoothingEnabled = false;
        ctx.scale(r, r);
        layer_arr.forEach(l => { ctx.drawImage(l.body, 0, 0) });
        canvas_handler({ canvas, set_selected, set_modal_open, set_modal_size, set_modal_contents, canvas_size, layer_arr, opening_file_path })

    })
}

type project_export_argsT = {
    set_selected: SetterOrUpdater<number>
    set_modal_open: SetterOrUpdater<boolean>,
    set_modal_size: SetterOrUpdater<{ w: number, h: number }>,
    set_modal_contents: SetterOrUpdater<string | React.ReactNode[]>,
    canvas_size: { width: number, height: number },
    layer_arr: Layer[],
    opening_file_path: State<Option<string>>,
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
