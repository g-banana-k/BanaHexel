import { invoke } from "@tauri-apps/api/core";
import { Option, Result, State, UnRequired } from "./common/utils"
import { appDataDir, join } from "@tauri-apps/api/path";
import { Layer } from "./data";
import { SetterOrUpdater } from "recoil";
import { UndoStack } from "./canvas_area/undo";
import { exists } from "@tauri-apps/plugin-fs";

export type data_fileT = {
    layers: string[],
    meta_data: {
        canvas_size: {
            width: number,
            height: number,
        },
    },
}

export const read_file_from_path = async (path: string): Promise<Result<data_fileT, unknown>> => {
    const v = await Result.from_try_catch_async<[string, string[]]>((() => invoke("open_file_from_path", { path })))
    return v.on_ok(([canvas_size, layers]) => ({ layers, meta_data: JSON.parse(canvas_size) }))
}

export const read_file = async (): Promise<Result<Option<[string, data_fileT]>, unknown>> => {
    const v = await Result.from_try_catch_async<[string, [string, string[]]] | null>(() => invoke("open_file", {}));
    return v.on_ok(v =>
        Option.from_nullable(v)
            .on_some(([path, [canvas_size, layers]]) => ([path, { layers, meta_data: JSON.parse(canvas_size) }] as [string, data_fileT]))
    ).on_err(_ => _);
}

export const binary_to_bitmap = (data: string): Promise<Result<ImageBitmap, unknown>> => Result.from_try_catch_async(async () => {
    const data_url = `data:image/png;base64,${data}`;
    const image_bitmap = await createImageBitmap(await fetch(data_url).then(res => res.blob()));
    return image_bitmap;
})

export const write_file_new =
    async (
        data: {
            layers: HTMLCanvasElement[],
            meta_data: {
                canvas_size: {
                    width: number,
                    height: number,
                }
            }
        },
    ): Promise<Result<Option<string>, unknown>> => {
        const layers: string[] = [];
        data.layers.forEach((c) => {
            layers.push(canvas_to_binary(c))
        });
        const res = (await Result.from_try_catch_async(async () => await invoke<string>("save_file_new", {
            layers: layers,
            metaData: JSON.stringify(data.meta_data),
        }))).on_ok(v => v ? Option.Some<string>(v) : Option.None<string>())
        return res;
    }

export const write_file_with_path =
    async (
        path: string,
        data: {
            layers: HTMLCanvasElement[],
            meta_data: {
                canvas_size: {
                    width: number,
                    height: number,
                }
            }
        },
    ): Promise<Option<0>> => {
        const layers: string[] = [];
        data.layers.forEach((c) => {
            layers.push(canvas_to_binary(c))
        });
        await invoke("write_file_with_path", {
            path: path,
            layers: layers,
            meta_data: JSON.stringify(data.meta_data),
        })
        return Option.Some(0)
    }


export const canvas_to_binary = (canvas: HTMLCanvasElement): string => {
    return canvas.toDataURL('image/png').split(',')[1];
}

//　export const open_file_from_path = async (path: string): Promise<Result<data_fileT, unknown>> => {
//　    const v = await Result.from_try_catch_async<[string, Uint8Array[]]>((() => invoke("open_file_from_path", { path })))
//　    return v.on_ok(([canvas_size, layers]) => ({ layers, canvas_size: JSON.parse(canvas_size) }))
//　}

// export const binary_to_bitmap = async (data: Uint8Array): Promise<Result<ImageBitmap, unknown>> => Result.from_try_catch_async(async () => {
//     const blob = new Blob([data], { type: 'image/png' });
//     const image_bitmap = await createImageBitmap(blob);
//     return image_bitmap
// })

export type user_dataT = {
    palette: { code: string, uuid: string }[]
}

export const write_user_data = (() => {
    let is_writing = false;
    return async ({ user_data }: { user_data: user_dataT }) => {
        if (is_writing) return;
        is_writing = true;
        const dir = await appDataDir();
        const path = await join(dir, "user_data.json");
        await invoke("write_user_data", { dir: dir, path: path, data: JSON.stringify(user_data) })
        is_writing = false;
    }
})()

export const read_user_data = async (): Promise<user_dataT> => {
    const default_v = { palette: [] };
    const dir = await appDataDir();
    const path = await join(dir, "user_data.json");
    return (await exists(path)) ?
        (await Result.from_try_catch_async<user_dataT>(
            async () => JSON.parse(await invoke("read_user_data", { path })))
        ).unwrap_or(default_v) :
        default_v;
}

export type file_stateT = { saving: boolean, saved: boolean, has_file: boolean }

export const save_file_with_path = async ({
    file_state,
    opening_file_path,
    layer_arr,
    canvas_size
}: {
    file_state: State<file_stateT>,
    opening_file_path: State<Option<string>>,
    layer_arr: Layer[],
    canvas_size: { width: number, height: number, }
}) => {
    if (file_state.val_local().saving) return;
    file_state.set({ saving: true, saved: false, has_file: true })
    if (opening_file_path.val_local().is_some()) {
        await write_file_with_path(opening_file_path.val_local().unwrap(),
            { layers: layer_arr!.map((v) => v.body), meta_data: { canvas_size } }
        );
        file_state.set({ saving: false, saved: true, has_file: true });
    } else {
        const p = await write_file_new({ layers: layer_arr!.map((v) => v.body), meta_data: { canvas_size } });
        console.log(p);
        p.on_ok(p => p.on_some(p => {
            opening_file_path.set(Option.Some(p.split("/").at(-1)?.split("\\").at(-1)!));
            file_state.set({ saving: false, saved: true, has_file: true });
        }).on_none(() => {
            file_state.set({ saving: false, saved: false, has_file: false });
        }));
    }
}

export const save_file_new = async ({
    file_state,
    opening_file_path,
    layer_arr,
    canvas_size
}: {
    file_state: State<file_stateT>,
    opening_file_path: State<Option<string>>,
    layer_arr: Layer[],
    canvas_size: { width: number, height: number, }
}) => {
    if (file_state.val_local().saving) return;
    console.log("wowow")
    const had_file = file_state.val_local().has_file;
    file_state.set({ saving: true, saved: false, has_file: true })
    const p = await write_file_new({ layers: layer_arr!.map((v) => v.body), meta_data: { canvas_size } });
    p.on_ok(p => p.on_some(p => {
        opening_file_path.set(Option.Some(p.split("/").at(-1)?.split("\\").at(-1)!));
        file_state.set({ saving: false, saved: true, has_file: true });
    }).on_none(() => {
        file_state.set({ saving: false, saved: false, has_file: had_file });
    }));

}

export const open_file = async (
    {
        undo_stack,
        set_loading,
        set_layer_arr,
        set_canvas_size,
        set_current_layer,
        opening_file_path,
        load_file,
        file_state
    }: {
        undo_stack: UndoStack,
        set_loading: SetterOrUpdater<boolean>,
        set_layer_arr: SetterOrUpdater<Layer[] | undefined>,
        set_canvas_size: SetterOrUpdater<{ width: number, height: number } | undefined>,
        set_current_layer: SetterOrUpdater<number>,
        file_state: State<file_stateT>,
        opening_file_path: State<Option<string>>,
        load_file: (data: UnRequired<data_fileT, "layers">, setters: {
            set_layer_arr: (arg0: Layer[]) => void;
            set_canvas_size: (arg0: {
                width: number;
                height: number;
            }) => void;
            set_loading: (arg0: boolean) => void;
            set_current_layer: (arg0: number | ((arg0: number) => number)) => void;
        }) => Promise<void>,
    }) => {
    if (file_state.val_local().saving) return;
    const new_data = (await read_file()).unwrap();
    new_data.on_some(async v => {
        undo_stack.clear();
        set_loading(true);
        opening_file_path.set(Option.Some(v[0]));
        await load_file(v[1], { set_loading, set_layer_arr, set_canvas_size, set_current_layer });
        set_loading(false);
        file_state.set({ saving: false, saved: true, has_file: true })
    })
}