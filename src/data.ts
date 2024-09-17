import { invoke } from "@tauri-apps/api";
import { Result } from "./utils";

export type layerT = { body: HTMLCanvasElement, ctx: CanvasRenderingContext2D, preview: HTMLCanvasElement }

type data_fileT = {
    layers: string[],
    canvas_size: {
        width: number,
        height: number,
    },
}

export const load_file = async (path: string): Promise<Result<data_fileT, unknown>> => {
    const v = await Result.from_try_catch_async<[string, string[]]>((() => invoke("load_file", { path })))
    return v.on_ok(([canvas_size, layers]) => ({ layers, canvas_size: JSON.parse(canvas_size) }))
}

export const binary_to_bitmap = (data: string): Promise<Result<ImageBitmap, unknown>> => Result.from_try_catch_async(async () => {
    const data_url = `data:image/png;base64,${data}`;
    const image_bitmap = await createImageBitmap(await fetch(data_url).then(res => res.blob()));
    return image_bitmap;
})

export const save_file = async (
    data: {
        layers: HTMLCanvasElement[],
        meta_data: {
            canvas_size: {
                width: number,
                height: number,
            }
        }
    },
    path: string
): Promise<void> => {
    const layers: string[] = [];
    data.layers.forEach((c) => {
        layers.push(canvas_to_binary(c))
    });
    await invoke("save_file", {
        layers: layers,
        metaData: JSON.stringify(data.meta_data),
        path: path,
    })
}

export const canvas_to_binary = (canvas: HTMLCanvasElement): string => {
    return canvas.toDataURL('image/png').split(',')[1];
}

//　export const load_file = async (path: string): Promise<Result<data_fileT, unknown>> => {
//　    const v = await Result.from_try_catch_async<[string, Uint8Array[]]>((() => invoke("load_file", { path })))
//　    return v.on_ok(([canvas_size, layers]) => ({ layers, canvas_size: JSON.parse(canvas_size) }))
//　}

// export const binary_to_bitmap = async (data: Uint8Array): Promise<Result<ImageBitmap, unknown>> => Result.from_try_catch_async(async () => {
//     const blob = new Blob([data], { type: 'image/png' });
//     const image_bitmap = await createImageBitmap(blob);
//     return image_bitmap
// })
