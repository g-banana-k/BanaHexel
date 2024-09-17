import { invoke } from "@tauri-apps/api";
import { Result } from "./utils";

export type layerT = { body: HTMLCanvasElement, ctx: CanvasRenderingContext2D, preview: HTMLCanvasElement }

type data_fileT = {
    layers: string[],
    meta_data: {
        width: number,
        height: number,
    },
}

export const load_file = async (path: string): Promise<Result<data_fileT, unknown>> => {
    const v = await Result.from_try_catch_async<[string, string[]]>((() => invoke("load_file", { path })))
    return v.on_ok(([meta_data, layers]) => ({ layers, meta_data: JSON.parse(meta_data) }))
}

export const binary_to_bitmap = (data: string): Promise<Result<ImageBitmap, unknown>> => Result.from_try_catch_async(async () => {
    const data_url = `data:image/png;base64,${data}`;
    const image_bitmap = await createImageBitmap(await fetch(data_url).then(res => res.blob()));
    return image_bitmap;
})

//　export const load_file = async (path: string): Promise<Result<data_fileT, unknown>> => {
//　    const v = await Result.from_try_catch_async<[string, Uint8Array[]]>((() => invoke("load_file", { path })))
//　    return v.on_ok(([meta_data, layers]) => ({ layers, meta_data: JSON.parse(meta_data) }))
//　}

// export const binary_to_bitmap = async (data: Uint8Array): Promise<Result<ImageBitmap, unknown>> => Result.from_try_catch_async(async () => {
//     const blob = new Blob([data], { type: 'image/png' });
//     const image_bitmap = await createImageBitmap(blob);
//     return image_bitmap
// })
