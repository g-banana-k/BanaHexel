import { invoke } from "@tauri-apps/api";
import { Option, Result } from "./utils";

export class Layer{
    body: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    preview: HTMLCanvasElement;
    constructor(bitmap: CanvasImageSource | undefined, canvas_size: { width: number, height: number }) {
        const canvas = document.createElement("canvas");
        canvas.width = canvas_size.width;
        canvas.height = canvas_size.height;
        const ctx = canvas.getContext("2d")!;
        if (bitmap) ctx.drawImage(bitmap, 0, 0);
        const preview = document.createElement("canvas");
        preview.width = 100;
        preview.height = 100;
        const preview_ctx = preview.getContext("2d")!;
        if (canvas.width < canvas.height) {
            preview_ctx.drawImage(canvas, 50 * (1 - canvas.width / canvas.height), 0, 100 * canvas.width / canvas.height, 100);
        } else {
            preview_ctx.drawImage(canvas, 0, 50 * (1 - canvas.height / canvas.width), 100, 100 * canvas.height / canvas.width);
        }
        this.body = canvas;
        this.ctx = ctx;
        this.preview = preview;
    }
    preview_update() {
        const preview_ctx = this.preview.getContext("2d")!;
        const canvas = this.body;
        preview_ctx.clearRect(0, 0, 100, 100); // 以前の内容をクリア
        if (canvas.width < canvas.height) {
            preview_ctx.drawImage(canvas, 50 * (1 - canvas.width / canvas.height), 0, 100 * canvas.width / canvas.height, 100);
        } else {
            preview_ctx.drawImage(canvas, 0, 50 * (1 - canvas.height / canvas.width), 100, 100 * canvas.height / canvas.width);
        }
    }
}

export type data_fileT = {
    layers: string[],
    meta_data: {
        canvas_size: {
            width: number,
            height: number,
        },
    },
}

export const open_file_from_path = async (path: string): Promise<Result<data_fileT, unknown>> => {
    const v = await Result.from_try_catch_async<[string, string[]]>((() => invoke("open_file_from_path", { path })))
    return v.on_ok(([canvas_size, layers]) => ({ layers, meta_data: JSON.parse(canvas_size) }))
}

export const open_file = async (): Promise<Result<Option<[string, data_fileT]>, unknown>> => {
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

export const save_file_new = async (
    data: {
        layers: HTMLCanvasElement[],
        meta_data: {
            canvas_size: {
                width: number,
                height: number,
            }
        }
    },
): Promise<string> => {
    const layers: string[] = [];
    data.layers.forEach((c) => {
        layers.push(canvas_to_binary(c))
    });
    return await invoke("save_file_new", {
        layers: layers,
        metaData: JSON.stringify(data.meta_data),
    })
}

export const save_file_with_path = async (
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
): Promise<void> => {
    const layers: string[] = [];
    data.layers.forEach((c) => {
        layers.push(canvas_to_binary(c))
    });
    await invoke("save_file_with_path", {
        path: path,
        layers: layers,
        metaData: JSON.stringify(data.meta_data),
    })
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
