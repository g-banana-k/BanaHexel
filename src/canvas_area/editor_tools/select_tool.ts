import { argsT, toolT } from ".";
import { Option, Result } from "../../common/utils";
import { CanvasPart, clone_canvas } from "../undo";

export const select_tool = ({
    canvas,
    ctx,
    layers_arr,
    current_layer,
    undo_stack,
    file_state,
    need_on_end,
}: argsT): toolT => {
    let b_x = 0;
    let b_y = 0;
    let prev_layer_i = Option.None<number>();
    let clipping = Option.None<Clip>();
    let is_try_clipping = false;

    let o_u = Option.None<HTMLCanvasElement>();

    document.addEventListener("select_area_event", async e => {
        if (!clipping.is_some()) return;
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
                lt_x: cl.lt_x,
                lt_y: cl.lt_y,
                rb_x: cl.rb_x,
                rb_y: cl.rb_y,
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
                lt_x: cl.lt_x,
                lt_y: cl.lt_y,
                rb_x: cl.rb_x,
                rb_y: cl.rb_y,
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
            const layer = layers_arr.val_global()![current_layer.val_global()];
            const { lt_x, lt_y, w, h } = cl_to_pos(cl, canvas);
            const u = new CanvasPart(lt_x, lt_y, w, h, o_u.unwrap());
            const r = new CanvasPart(lt_x, lt_y, w, h, layer.body);
            const i = current_layer.val_local();
            clipping = Option.None();
            undo_stack.push({ i, u, r });
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
                const i = current_layer.val_local();
                const { lt_x, lt_y, w, h } = cl_to_pos(cl, canvas);
                const u = new CanvasPart(lt_x, lt_y, w, h, o_u.unwrap());
                layer.ctx.drawImage(cl.canvas, cl.x, cl.y);
                const r = new CanvasPart(lt_x, lt_y, w, h, layer.body);
                layer.preview_update();
                layers_arr.set([...layers_arr.val_local()!]);
                undo_stack.push({ i, u, r });
                clipping = Option.None();
                file_state.set(_ => ({ saving: _.saving, saved: false, has_file: _.has_file }));
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
                is_try_clipping = true;
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
                ctx.fillRect(cl.x + x - b_x, cl.y + y - b_y, cl.w, cl.h);
                file_state.set(_ => ({ saving: _.saving, saved: false, has_file: _.has_file }));
            } else if (is_try_clipping) {
                const [lt_x, rb_x] = b_x < x ? [b_x, x] : [x, b_x];
                const [lt_y, rb_y] = b_y < y ? [b_y, y] : [y, b_y];
                const layer = layers_arr.val_global()![current_layer.val_global()];
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const cl_canvas = document.createElement("canvas");
                cl_canvas.width = rb_x - lt_x + 1;
                cl_canvas.height = rb_y - lt_y + 1;
                const cl_ctx = cl_canvas.getContext("2d")!;
                cl_ctx.drawImage(layer.body, -lt_x, -lt_y);
                clipping = Option.Some({
                    lt_x: lt_x,
                    lt_y: lt_y,
                    rb_x: rb_x,
                    rb_y: rb_y,
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
                o_u = Option.Some(clone_canvas(layer.body));
                layer.ctx.clearRect(lt_x, lt_y, rb_x - lt_x + 1, rb_y - lt_y + 1);
                layer.preview_update();
                layers_arr.set([...layers_arr.val_local()!]);
                is_try_clipping = false;
                file_state.set(_ => ({ saving: _.saving, saved: false, has_file: _.has_file }));
            }
        },
        "move": ({ x, y }) => {
            if (clipping.is_some()) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#5fe07544";
            ctx.fillRect(x, y, 1, 1);
        },
        "on_end": () => {
            need_on_end.set(true);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            clipping.on_some(cl => {
                const layer = layers_arr.val_global()![current_layer.val_global()];
                const { lt_x, lt_y, w, h } = cl_to_pos(cl, canvas);
                const u = new CanvasPart(lt_x, lt_y, w, h, o_u.unwrap());
                layer.ctx.drawImage(cl.canvas, cl.x, cl.y);
                const r = new CanvasPart(lt_x, lt_y, w, h, layer.body);
                const i = current_layer.val_local();
                clipping = Option.None();
                undo_stack.push({ i, u, r });
                layer.preview_update();
                layers_arr.set([...layers_arr.val_local()!]);
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
            need_on_end.set(false);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (clipping.is_some()) {
                const cl = clipping.unwrap();
                const layer = layers_arr.val_global()![current_layer.val_global()];
                layer.ctx.drawImage(cl.canvas, cl.x, cl.y);
                layer.preview_update();
                layers_arr.set([...layers_arr.val_local()!]);
                clipping = Option.None();
            }
            const layer = layers_arr.val_global()![current_layer.val_global()];
            const cl_canvas = document.createElement("canvas");
            cl_canvas.width = canvas.width;
            cl_canvas.height = canvas.height;
            const cl_ctx = cl_canvas.getContext("2d")!;
            cl_ctx.drawImage(layer.body, 0, 0,);
            clipping = Option.Some({
                lt_x: 0,
                lt_y: 0,
                rb_x: 0,
                rb_y: 0,
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
            console.log("WA")
            ctx.fillRect(cl.x, cl.y, cl.w, cl.h)
            o_u = Option.Some(clone_canvas(layer.body));
            layer.ctx.clearRect(0, 0, layer.body.width, layer.body.height);
            layer.preview_update();
            layers_arr.set([...layers_arr.val_local()!]);
            file_state.set(_ => ({ saving: _.saving, saved: false, has_file: _.has_file }));
        },
        "on_ctrl_c": async () => {
            if (!clipping.is_some()) return;
            const cl = clipping.unwrap();
            const data_url = cl.canvas.toDataURL('image/png');

            const blob = await (await fetch(data_url)).blob();

            const clipboard_item = new ClipboardItem({
                [blob.type]: blob
            });

            const result = await Result.from_try_catch_async(async () => await navigator.clipboard.write([clipboard_item]));
        },
        "on_ctrl_v": async () => {
            if (clipping.is_some()) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const cl = clipping.unwrap();
                const layer = layers_arr.val_global()![current_layer.val_global()];
                const lt_x = Math.max(0, Math.min(cl.lt_x, cl.x));
                const lt_y = Math.max(0, Math.min(cl.lt_y, cl.y));
                const rb_x = Math.min(Math.max(cl.rb_x, cl.x + cl.w), canvas.width,);
                const rb_y = Math.min(Math.max(cl.rb_y, cl.y + cl.h), canvas.height);
                const w = rb_x - lt_x + 1;
                const h = rb_y - lt_y + 1;
                const i = current_layer.val_local();
                const u = new CanvasPart(lt_x, lt_y, w, h, o_u.unwrap());
                layer.ctx.drawImage(cl.canvas, cl.x, cl.y);
                const r = new CanvasPart(lt_x, lt_y, w, h, layer.body);
                layer.preview_update();
                layers_arr.set([...layers_arr.val_local()!]);
                clipping = Option.None();
                undo_stack.push({ i, u, r });
                file_state.set(_ => ({ saving: _.saving, saved: false, has_file: _.has_file }));
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
                        lt_x: 0,
                        lt_y: 0,
                        rb_x: 0,
                        rb_y: 0,
                        x: 0,
                        y: 0,
                        w: image.width,
                        h: image.height,
                        canvas: cl_canvas,
                        ctx: cl_ctx
                    });
                    const layer = layers_arr.val_global()![current_layer.val_global()];
                    o_u = Option.Some(clone_canvas(layer.body));
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

            const layer = layers_arr.val_global()![current_layer.val_global()];

            const { lt_x, lt_y, w, h } = cl_to_pos(cl, canvas);
            const i = current_layer.val_local();
            const u = new CanvasPart(lt_x, lt_y, w, h, o_u.unwrap());
            const r = new CanvasPart(lt_x, lt_y, w, h, layer.body);
            undo_stack.push({ i, u, r });
            file_state.set(_ => ({ saving: _.saving, saved: false, has_file: _.has_file }));
        },
    }
};

const cl_to_pos = (cl: Clip, canvas: HTMLCanvasElement) => {
    const lt_x = Math.max(0, Math.min(cl.lt_x, cl.x));
    const lt_y = Math.max(0, Math.min(cl.lt_y, cl.y));
    const rb_x = Math.min(Math.max(cl.rb_x, cl.x + cl.w), canvas.width,);
    const rb_y = Math.min(Math.max(cl.rb_y, cl.y + cl.h), canvas.height);
    const w = rb_x - lt_x + 1;
    const h = rb_y - lt_y + 1;
    return {
        lt_x,
        lt_y,
        rb_x,
        rb_y,
        w,
        h,
    }
}

type Clip = {
    lt_x: number,
    lt_y: number,
    rb_x: number,
    rb_y: number,
    x: number,
    y: number,
    w: number,
    h: number
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
}