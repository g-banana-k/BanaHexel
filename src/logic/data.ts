import { Result } from "./utils";

export const binary_to_bitmap = (data: string): Promise<Result<ImageBitmap, unknown>> => Result.from_try_catch_async(async () => {
    const data_url = `data:image/png;base64,${data}`;
    const image_bitmap = await createImageBitmap(await fetch(data_url).then(res => res.blob()));
    URL.revokeObjectURL(data_url)
    return image_bitmap;
})
