import "./file.css"

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { menu_bar_selected_atom, MenuButton, MenuContent } from ".";
import { Option, PromiseWithResolvers, Result, SetterOrUpdater, State, StateBySetter } from "../../../logic/utils";
import { useSetModal } from "../../modal";
import { load_file } from "../../../logic/app";
import { FileStateT, open_file, save_file_new, save_file_with_path } from "../../../logic/file";
import { write_image, write_user_data } from "../../../logic/command";
import { Layer } from "../../../logic/data";
import { Canvas } from "../../../logic/canvas";
import { canvas_size_atom, current_layer_atom, is_loading_atom, layer_arr_atom, user_data_atom } from "../../../app";
import { file_save_state_atom, meta_data_atom } from "../../../window";
import { undo_stack } from "../../../logic/canvas_area/undo";
import { useState } from "react";

export const FileMenuButton = () => {
    const [set_modal_contents, set_modal_size, set_modal_open] = useSetModal();
    let [selected, set_selected] = useAtom(menu_bar_selected_atom);

    const layer_arr = new StateBySetter(useSetAtom(layer_arr_atom))!;
    const canvas_size = useAtomValue(canvas_size_atom)!;
    const file_state = new State(useAtom(file_save_state_atom));

    const set_loading = useSetAtom(is_loading_atom);
    const set_canvas_size = useSetAtom(canvas_size_atom);
    const set_current_layer = useSetAtom(current_layer_atom);
    const set_meta_data = useSetAtom(meta_data_atom);

    const [new_project_size, set_new_project_size] = useState({ w: 64, h: 64 });

    const meta_data = useAtomValue(meta_data_atom);

    const user_data = useAtomValue(user_data_atom);

    return (
        <MenuButton label="ファイル" id="title_bar_menu_file_button" nth={0} selected={selected} set_selected={set_selected}>
            <MenuContent on_click={async () => {
                set_selected(-1);
                const { promise, resolve } = PromiseWithResolvers<Option<{ w: number, h: number }>>();
                let { w, h } = new_project_size
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
                                    set_new_project_size(_ => ({ ..._, h }));
                                }} />
                        </div>
                        <div className="new_project_modal_canvas_size_part">
                            <div className="new_project_modal_canvas_size_part_title">横幅</div>
                            <input className="new_project_modal_text_box" type="number" defaultValue={64} min={1}
                                onInput={e => {
                                    w = Math.max(1, Number.parseInt(e.currentTarget.value!));
                                    e.currentTarget.value = `${w}`;
                                    set_new_project_size(_ => ({ ..._, w }));
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
                    undo_stack.clear();
                    const canvas_w = !Number.isNaN(w) ? w : 64;
                    const canvas_h = !Number.isNaN(h) ? h : 64;
                    set_loading(true)
                    await load_file({ meta_data: { canvas_size: { width: canvas_w, height: canvas_h } } }, {
                        set_layer_arr: (layers) => layer_arr.set(layers), set_canvas_size, set_loading, set_current_layer, set_meta_data
                    });
                    set_loading(false)
                    file_state.set({ saving: false, saved: false, path: Option.None() })
                });
            }} >新規作成</MenuContent>
            <MenuContent on_click={async () => {
                set_selected(-1);
                save_file_new({
                    file_state: file_state.as_state_by_setter(),
                    layer_arr: layer_arr.val_global()!,
                    meta_data: meta_data.unwrap(),
                })
                write_user_data({ user_data: user_data.unwrap() })
            }} >名前を付けて保存</MenuContent>
            <MenuContent on_click={async () => {
                set_selected(-1);
                save_file_with_path({
                    file_state: file_state.as_state_by_setter(),
                    layer_arr: layer_arr.val_global()!,
                    meta_data: meta_data.unwrap(),
                })
                write_user_data({ user_data: user_data.unwrap() })
            }} >上書き保存</MenuContent>
            <MenuContent on_click={async () => {
                set_selected(-1);
                open_file({
                    undo_stack,
                    setters: {
                        set_loading,
                        set_layer_arr: (layers) => layer_arr.set(layers),
                        set_canvas_size,
                        set_current_layer,
                        set_meta_data,
                    },
                    file_state,
                })
                write_user_data({ user_data: user_data.unwrap() })
            }} >開く</MenuContent>
            <MenuContent on_click={
                () => project_export({
                    set_selected,
                    set_modal_open,
                    set_modal_size,
                    set_modal_contents,
                    canvas_size,
                    layer_arr: layer_arr.val_global()!,
                    file_state: file_state.val_global(),
                    canvas_handler: async ({ canvas, file_state }) => {
                        write_image({
                            img: canvas,
                            name: file_state.path.unwrap_or("新規プロジェクト").split("/").at(-1)?.split("\\").at(-1)!.replace(/^(.+)\..+$/, '$1')!,
                        })
                    }
                })
            }>エクスポート</MenuContent>
            <MenuContent on_click={
                () => project_export({
                    set_selected,
                    set_modal_open,
                    set_modal_size,
                    set_modal_contents,
                    canvas_size,
                    layer_arr: layer_arr.val_global()!,
                    file_state: file_state.val_global(),
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
    )
}

const project_export = async ({
    set_selected,
    set_modal_open,
    set_modal_size,
    set_modal_contents,
    canvas_size,
    layer_arr,
    canvas_handler,
    file_state
}: project_export_argsT & {
    canvas_handler: (args: project_export_argsT & { canvas: HTMLCanvasElement }) => Promise<void>;
}) => {
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
        const canvas = new Canvas({ width: canvas_size.width * r, height: canvas_size.height * r })
        canvas.ctx.imageSmoothingEnabled = false;
        canvas.ctx.scale(r, r);
        layer_arr.forEach(l => { canvas.ctx.drawImage(l.body, 0, 0) });
        canvas_handler({ canvas: canvas.body, set_selected, set_modal_open, set_modal_size, set_modal_contents, canvas_size, layer_arr, file_state })
    })
}

type project_export_argsT = {
    set_selected: SetterOrUpdater<number>
    set_modal_open: SetterOrUpdater<boolean>,
    set_modal_size: SetterOrUpdater<{ w: number, h: number }>,
    set_modal_contents: SetterOrUpdater<string | React.ReactNode[]>,
    canvas_size: { width: number, height: number },
    layer_arr: Layer[],
    file_state: FileStateT
}