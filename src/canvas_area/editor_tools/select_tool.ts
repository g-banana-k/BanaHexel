import { argsT, toolT } from ".";
import { Option, Result } from "../../common/utils";

export const select_tool = ({
    canvas,
    ctx,
    layers_arr,
    current_layer
}: argsT): toolT => {
    let b_x = 0;
    let b_y = 0;
    let prev_layer_i = Option.None<number>();
    let clipping = Option.None<{
        x: number,
        y: number,
        w: number,
        h: number
        canvas: HTMLCanvasElement,
        ctx: CanvasRenderingContext2D,
    }>();

    document.addEventListener("select_area_event", async e => {
        if (!clipping.is_some()) return;
        console.log(e.detail)
        const cl = clipping.unwrap()
        if (e.detail === "flip_vertical") {
            const img = await createImageBitmap(cl.canvas);
            cl.ctx.clearRect(0, 0, cl.canvas.width, cl.canvas.height);
            cl.ctx.save();
            cl.ctx.scale(-1, 1)
            cl.ctx.drawImage(img, -cl.canvas.width, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(cl.canvas, cl.x, cl.y);
            ctx.fillStyle = "#5fe07544";
            ctx.fillRect(cl.x, cl.y, cl.w, cl.h);
            cl.ctx.restore();
        }
        else if (e.detail === "flip_horizontal") {
            const img = await createImageBitmap(cl.canvas);
            cl.ctx.clearRect(0, 0, cl.canvas.width, cl.canvas.height);
            cl.ctx.save();
            cl.ctx.scale(1, -1)
            cl.ctx.drawImage(img, 0, -cl.canvas.height);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(cl.canvas, cl.x, cl.y);
            ctx.fillStyle = "#5fe07544";
            ctx.fillRect(cl.x, cl.y, cl.w, cl.h);
            cl.ctx.restore();
        }
        else if (e.detail === "rotate_r90") {
            const new_canvas = document.createElement("canvas");
            new_canvas.width = cl.h;
            new_canvas.height = cl.w;
            const new_ctx = new_canvas.getContext("2d")!;
            new_ctx.save();
            new_ctx.rotate(Math.PI / 2);
            new_ctx.drawImage(cl.canvas, 0, -cl.h);
            new_ctx.restore();
            const center_x = cl.x + Math.floor(cl.w / 2);
            const center_y = cl.y + Math.floor(cl.h / 2);
            clipping = Option.Some({
                x: center_x - Math.floor(cl.h / 2),
                y: center_y - Math.floor(cl.w / 2),
                w: cl.h,
                h: cl.w,
                canvas: new_canvas,
                ctx: new_ctx,
            });
            const d = clipping.unwrap();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(d.canvas, d.x, d.y);
            ctx.fillStyle = "#5fe07544";
            ctx.fillRect(d.x, d.y, d.w, d.h);
        }
        else if (e.detail === "rotate_l90") {
            const new_canvas = document.createElement("canvas");
            new_canvas.width = cl.h;
            new_canvas.height = cl.w;
            const new_ctx = new_canvas.getContext("2d")!;
            new_ctx.save();
            new_ctx.rotate(-Math.PI / 2);
            new_ctx.drawImage(cl.canvas, -cl.w, 0);
            new_ctx.restore();
            const center_x = cl.x + Math.floor(cl.w / 2);
            const center_y = cl.y + Math.floor(cl.h / 2);
            clipping = Option.Some({
                x: center_x - Math.floor(cl.h / 2),
                y: center_y - Math.floor(cl.w / 2),
                w: cl.h,
                h: cl.w,
                canvas: new_canvas,
                ctx: new_ctx,
            });
            const d = clipping.unwrap();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(d.canvas, d.x, d.y);
            ctx.fillStyle = "#5fe07544";
            ctx.fillRect(d.x, d.y, d.w, d.h);
        }
        else if (e.detail === "trash") {
            clipping = Option.None();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    })
    return {
        "down": ({ x, y }) => {
            b_x = x;
            b_y = y;
            if (clipping.is_some()
                && clipping.unwrap().x <= x && x <= clipping.unwrap().x + clipping.unwrap().w - 1
                && clipping.unwrap().y <= y && y <= clipping.unwrap().y + clipping.unwrap().h - 1
            ) {
                const cl = clipping.unwrap();
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(cl.canvas, cl.x + x - b_x, cl.y + y - b_y);
                ctx.strokeStyle = "#5fe07544";
                ctx.strokeRect(cl.x + x - b_x + 0.5, cl.y + y - b_y + 0.5, cl.w - 1, cl.h - 1);
            } else if (clipping.is_some()) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const cl = clipping.unwrap();
                const layer = layers_arr.val_global()![current_layer.val_global()];
                layer.ctx.drawImage(cl.canvas, cl.x, cl.y);
                layer.preview_update();
                layers_arr.set([...layers_arr.val_local()!]);
                clipping = Option.None();
            } else { }
        },
        "tool_move": ({ x, y }) => {
            if (clipping.is_some()) {
                const cl = clipping.unwrap();
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(cl.canvas, cl.x + x - b_x, cl.y + y - b_y);
                ctx.strokeStyle = "#5fe07544";
                ctx.strokeRect(cl.x + x - b_x + 0.5, cl.y + y - b_y + 0.5, cl.w - 1, cl.h - 1);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "#5fe07566";
                const [lt_x, rb_x] = b_x < x ? [b_x, x] : [x, b_x];
                const [lt_y, rb_y] = b_y < y ? [b_y, y] : [y, b_y];
                ctx.fillRect(lt_x, lt_y, rb_x - lt_x + 1, rb_y - lt_y + 1);
            }
        },
        "up": ({ x, y, was_down }) => {
            if (!was_down) return;
            if (clipping.is_some()) {
                const cl = clipping.unwrap();
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(cl.canvas, cl.x + x - b_x, cl.y + y - b_y);
                clipping = Option.Some({ ...cl, x: cl.x + x - b_x, y: cl.y + y - b_y });
                ctx.fillStyle = "#5fe07544";
                ctx.fillRect(cl.x + x - b_x, cl.y + y - b_y, cl.w, cl.h)
            } else {
                const [lt_x, rb_x] = b_x < x ? [b_x, x] : [x, b_x];
                const [lt_y, rb_y] = b_y < y ? [b_y, y] : [y, b_y];
                const layer = layers_arr.val_global()![current_layer.val_global()];
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const cl_canvas = document.createElement("canvas");
                cl_canvas.width = rb_x - lt_x + 1;
                cl_canvas.height = rb_y - lt_y + 1;
                const cl_ctx = cl_canvas.getContext("2d")!;
                cl_ctx.drawImage(layer.body, lt_x, lt_y, rb_x - lt_x + 1, rb_y - lt_y + 1, 0, 0, rb_x - lt_x + 1, rb_y - lt_y + 1,);
                clipping = Option.Some({
                    x: lt_x,
                    y: lt_y,
                    w: rb_x - lt_x + 1,
                    h: rb_y - lt_y + 1,
                    canvas: cl_canvas,
                    ctx: cl_ctx
                });
                const cl = clipping.unwrap();
                ctx.drawImage(cl.canvas, cl.x, cl.y);
                ctx.fillStyle = "#5fe07544";
                ctx.fillRect(cl.x, cl.y, cl.w, cl.h)
                layer.ctx.clearRect(lt_x, lt_y, rb_x - lt_x + 1, rb_y - lt_y + 1);
                layer.preview_update();
                layers_arr.set([...layers_arr.val_local()!]);
            }
        },
        "move": ({ x, y }) => {
            if (clipping.is_some()) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#5fe07544";
            ctx.fillRect(x, y, 1, 1);
        },
        "on_end": () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            clipping.on_some(cl => {
                const layer = layers_arr.val_global()![current_layer.val_global()];
                layer.ctx.drawImage(cl.canvas, cl.x, cl.y);
                layer.preview_update();
                layers_arr.set([...layers_arr.val_local()!]);
                clipping = Option.None();
            });
            prev_layer_i = Option.Some(current_layer.val_local());
        },
        "on_start": () => {
            prev_layer_i = Option.Some(current_layer.val_local());
        },
        "on_canvas_change": () => {
            const prev_layer = layers_arr.val_global()![prev_layer_i.unwrap_or(0)];
            clipping.on_some(cl => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                prev_layer.ctx.drawImage(cl.canvas, cl.x, cl.y);
                prev_layer.preview_update();
                layers_arr.set([...layers_arr.val_local()!]);
                clipping = Option.None();
            });
        },
        "on_ctrl_a": () => {
            if (clipping.is_some()) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const cl = clipping.unwrap();
                const layer = layers_arr.val_global()![current_layer.val_global()];
                layer.ctx.drawImage(cl.canvas, cl.x, cl.y);
                layer.preview_update();
                layers_arr.set([...layers_arr.val_local()!]);
                clipping = Option.None();
            }
            const layer = layers_arr.val_global()![current_layer.val_global()];
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cl_canvas = document.createElement("canvas");
            cl_canvas.width = canvas.width;
            cl_canvas.height = canvas.height;
            const cl_ctx = cl_canvas.getContext("2d")!;
            cl_ctx.drawImage(layer.body, 0, 0,);
            clipping = Option.Some({
                x: 0,
                y: 0,
                w: canvas.width,
                h: canvas.height,
                canvas: cl_canvas,
                ctx: cl_ctx
            });
            const cl = clipping.unwrap();
            ctx.drawImage(cl.canvas, cl.x, cl.y);
            ctx.fillStyle = "#5fe07544";
            ctx.fillRect(cl.x, cl.y, cl.w, cl.h)
            layer.ctx.clearRect(0, 0, layer.body.width, layer.body.height);
            layer.preview_update();
            layers_arr.set([...layers_arr.val_local()!]);

        },
        "on_ctrl_c": async () => {
            if (!clipping.is_some()) return;
            const cl = clipping.unwrap();
            const data_url = cl.canvas.toDataURL('image/png');

            const blob = await (await fetch(data_url)).blob();

            // Clipboardに画像をコピー
            const clipboard_item = new ClipboardItem({
                [blob.type]: blob
            });

            const result = await Result.from_try_catch_async(async () => await navigator.clipboard.write([clipboard_item]));
            result.on_err(console.log);
        },
        "on_ctrl_v": async () => {
            if (clipping.is_some()) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const cl = clipping.unwrap();
                const layer = layers_arr.val_global()![current_layer.val_global()];
                layer.ctx.drawImage(cl.canvas, cl.x, cl.y);
                layer.preview_update();
                layers_arr.set([...layers_arr.val_local()!]);
                clipping = Option.None();
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const items_res = await Result.from_try_catch_async(async () => await navigator.clipboard.read());
            if (!items_res.is_ok()) return;
            const items = items_res.unwrap()
            for (const item of items) {
                const types = item.types;

                if (types.includes('image/png') || types.includes('image/jpeg')) {
                    const blob_res = await Result.from_try_catch_async(async () => await item.getType('image/png')); await item.getType('image/png');
                    if (!blob_res.is_ok()) return;
                    const blob = blob_res.unwrap();
                    const image = await createImageBitmap(blob);

                    const cl_canvas = document.createElement("canvas");
                    cl_canvas.width = image.width;
                    cl_canvas.height = image.height;
                    const cl_ctx = cl_canvas.getContext("2d")!;
                    cl_ctx.drawImage(image, 0, 0);
                    clipping = Option.Some({
                        x: 0,
                        y: 0,
                        w: image.width,
                        h: image.height,
                        canvas: cl_canvas,
                        ctx: cl_ctx
                    });
                    const cl = clipping.unwrap();
                    ctx.drawImage(cl.canvas, cl.x, cl.y);
                    ctx.fillStyle = "#5fe07544";
                    ctx.fillRect(cl.x, cl.y, cl.w, cl.h)
                    break;
                }
            }
        },
        "on_ctrl_x": async () => {
            if (!clipping.is_some()) return;
            const cl = clipping.unwrap();
            const data_url = cl.canvas.toDataURL('image/png');

            const blob = await (await fetch(data_url)).blob();

            const clipboard_item = new ClipboardItem({
                [blob.type]: blob
            });

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            clipping = Option.None();

            const result = await Result.from_try_catch_async(async () => await navigator.clipboard.write([clipboard_item]));
            result.on_err(console.log);
        },
    }
};