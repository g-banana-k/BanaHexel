import { invoke } from "@tauri-apps/api/core"
import { Option, Result } from "./common/utils"
import { appDataDir, join } from "@tauri-apps/api/path"
import { exists } from "@tauri-apps/plugin-fs"
import { MetaDataT } from "./file"

export type DataFileT = {
    layers: string[],
    meta_data: {
        canvas_size: {
            width: number,
            height: number,
        },
    },
}

export const read_file_from_path = async (path: string): Promise<Result<DataFileT, unknown>> => {
    const v = await Result.from_try_catch_async<[string, string[]]>((() => invoke("open_file_from_path", { path })))
    return v.on_ok(([canvas_size, layers]) => ({ layers, meta_data: JSON.parse(canvas_size) }))
}

export const read_file = async (): Promise<Result<Option<[string, DataFileT]>, unknown>> => {
    const v = await Result.from_try_catch_async<[string, [string, string[]]] | null>(() => invoke("open_file", {}));
    return v.on_ok(v =>
        Option.from_nullable(v)
            .on_some(([path, [canvas_size, layers]]) => ([path, { layers, meta_data: JSON.parse(canvas_size) }] as [string, DataFileT]))
    );
}


export const write_file_new = async (
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
        layers.push(c.toDataURL("image/png").split(",")[1])
    });
    const res = (await Result.from_try_catch_async(async () => await invoke<string>("save_file_new", {
        layers: layers,
        meta_data: JSON.stringify(data.meta_data),
    }))).on_ok(v => v ? Option.Some<string>(v) : Option.None<string>())
    layers.forEach(url => URL.revokeObjectURL(url))
    return res;
}


export const write_file_with_path = async (
    path: string,
    data: {
        layers: HTMLCanvasElement[],
        meta_data: MetaDataT
    },
): Promise<Option<0>> => {
    const layers: string[] = [];
    data.layers.forEach((c) => {
        layers.push(c.toDataURL("image/png").split(",")[1])
    });
    await invoke("write_file_with_path", {
        path: path,
        layers: layers,
        meta_data: JSON.stringify(data.meta_data),
    })
    layers.forEach(url => URL.revokeObjectURL(url))
    return Option.Some(0)
}


export type UserDataT = {
    palette: { code: string, uuid: string }[]
    theme: string,
}


export const write_user_data = async ({ user_data }: { user_data: UserDataT }) => {
    const dir = await appDataDir();
    const path = await join(dir, "user_data.json");
    await invoke("write_user_data", { dir: dir, path: path, data: JSON.stringify(user_data) })
}

export const read_user_data = async (): Promise<UserDataT> => {
    const default_v = { palette: [], theme: "dark" };
    const dir = await appDataDir();
    const path = await join(dir, "user_data.json");
    return (await exists(path)) ?
        (await Result.from_try_catch_async<UserDataT>(
            async () => JSON.parse(await invoke("read_user_data", { path })))
        ).unwrap_or(default_v) :
        default_v;
}

export const write_image = async ({img, name}: {img: HTMLCanvasElement, name: string}) => {
    const data = img.toDataURL("image/png").split(",")[1];
    const res = (await Result.from_try_catch_async(async () => await invoke<string>("export_image", {
        img: data,
        name,
    }))).on_ok(v => v ? Option.Some<string>(v) : Option.None<string>());
}
