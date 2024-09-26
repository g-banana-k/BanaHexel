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
        lt_x: number,
        rb_x: number,
        lt_y: number,
        rb_y: number,
        canvas: HTMLCanvasElement,
        ctx: CanvasRenderingContext2D,
    }>();
    return {
        "down": ({ x, y }) => {
            b_x = x;
            b_y = y;
            if (clipping.is_some()
                && clipping.unwrap().x <= x && x <= clipping.unwrap().x + clipping.unwrap().rb_x - clipping.unwrap().lt_x
                && clipping.unwrap().y <= y && y <= clipping.unwrap().y + clipping.unwrap().rb_y - clipping.unwrap().lt_y
            ) {
                const cl = clipping.unwrap();
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(cl.canvas, cl.x + x - b_x, cl.y + y - b_y);
                ctx.strokeStyle = "#5fe07544";
                ctx.strokeRect(cl.x + x - b_x + 0.5, cl.y + y - b_y + 0.5, cl.rb_x - cl.lt_x, cl.rb_y - cl.lt_y);
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
                ctx.strokeRect(cl.x + x - b_x + 0.5, cl.y + y - b_y + 0.5, cl.rb_x - cl.lt_x, cl.rb_y - cl.lt_y);
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
                ctx.fillRect(cl.x + x - b_x, cl.y + y - b_y, cl.rb_x - cl.lt_x + 1, cl.rb_y - cl.lt_y + 1)
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
                    lt_x,
                    rb_x,
                    lt_y,
                    rb_y,
                    canvas: cl_canvas,
                    ctx: cl_ctx
                });
                const cl = clipping.unwrap();
                ctx.drawImage(cl.canvas, cl.x, cl.y);
                ctx.fillStyle = "#5fe07544";
                ctx.fillRect(cl.x, cl.y, cl.rb_x - cl.lt_x + 1, cl.rb_y - cl.lt_y + 1)
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
            const prev_layer = layers_arr.val_global()![prev_layer_i.unwrap()];
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
                lt_x: 0,
                rb_x: canvas.width - 1,
                lt_y: 0,
                rb_y: canvas.height - 1,
                canvas: cl_canvas,
                ctx: cl_ctx
            });
            const cl = clipping.unwrap();
            ctx.drawImage(cl.canvas, cl.x, cl.y);
            ctx.fillStyle = "#5fe07544";
            ctx.fillRect(cl.x, cl.y, cl.rb_x - cl.lt_x + 1, cl.rb_y - cl.lt_y + 1)
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
        "on_ctrl_v": () => { },
        "on_ctrl_x": () => { },
    }
};