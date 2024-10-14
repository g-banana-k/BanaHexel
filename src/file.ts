import { invoke } from "@tauri-apps/api/core";
import { Option, Result, State, StateBySetter, UnRequired } from "./common/utils"
import { appDataDir, join } from "@tauri-apps/api/path";
import { Layer } from "./data";
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

export type user_dataT = {
    palette: { code: string, uuid: string }[]
    theme: string,
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
    );
}

export const binary_to_bitmap = (data: string): Promise<Result<ImageBitmap, unknown>> => Result.from_try_catch_async(async () => {
    const data_url = `data:image/png;base64,${data}`;
    const image_bitmap = await createImageBitmap(await fetch(data_url).then(res => res.blob()));
    URL.revokeObjectURL(data_url)
    return image_bitmap;
})

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
        layers.push(canvas_to_binary(c))
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
    layers.forEach(url => URL.revokeObjectURL(url))
    return Option.Some(0)
}


export const canvas_to_binary = (canvas: HTMLCanvasElement): string => {
    return canvas.toDataURL('image/png').split(',')[1];
}

export const write_user_data = async ({ user_data }: { user_data: user_dataT }) => {
    const dir = await appDataDir();
    const path = await join(dir, "user_data.json");
    await invoke("write_user_data", { dir: dir, path: path, data: JSON.stringify(user_data) })
}

export const read_user_data = async (): Promise<user_dataT> => {
    const default_v = { palette: [], theme: "dark" };
    const dir = await appDataDir();
    const path = await join(dir, "user_data.json");
    return (await exists(path)) ?
        (await Result.from_try_catch_async<user_dataT>(
            async () => JSON.parse(await invoke("read_user_data", { path })))
        ).unwrap_or(default_v) :
        default_v;
}

export const export_image = async ({
    img,
    project_name
}: {
    img: HTMLCanvasElement,
    project_name: string | undefined,
}) => {
    const url = canvas_to_binary(img);
    const res = (await Result.from_try_catch_async(async () => await invoke<string>("export_image", {
        img: url,
        project_name,
    }))).on_ok(v => v ? Option.Some<string>(v) : Option.None<string>());
    URL.revokeObjectURL(url)
}

export const save_file_with_path = async ({
    opening_file_path,
    layer_arr,
    canvas_size
}: {
    opening_file_path: StateBySetter<Option<string>>,
    layer_arr: Layer[],
    canvas_size: { width: number, height: number, }
}) => {
    if (opening_file_path.val_global().is_some()) {
        await write_file_with_path(opening_file_path.val_local().unwrap().unwrap(),
            { layers: layer_arr!.map((v) => v.body), meta_data: { canvas_size } }
        );
    } else {
        const p = await write_file_new({ layers: layer_arr!.map((v) => v.body), meta_data: { canvas_size } });
        p.on_ok(p => p.on_some(p => {
            opening_file_path.set(Option.Some(p));
        }));
    }
}

export const save_file_new = async ({
    opening_file_path,
    layer_arr,
    canvas_size
}: {
    opening_file_path: State<Option<string>>,
    layer_arr: Layer[],
    canvas_size: { width: number, height: number, }
}) => {
    const p = await write_file_new({ layers: layer_arr!.map((v) => v.body), meta_data: { canvas_size } });
    p.on_ok(p => p.on_some(p => {
        opening_file_path.set(Option.Some(p));
    }))
}