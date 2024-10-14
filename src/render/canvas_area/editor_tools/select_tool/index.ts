import { argsT, toolT } from "..";
import { Layer } from "../../../../logic/data";
import { FileStateT } from "../../../../logic/file";
import { create_canvas, Option, Result, State } from "../../../../logic/utils";
import { CanvasPart, UndoStack } from "../../undo";

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
    let clip = Option.None<Clip>();
    let is_try_clipping = false;

    let o_u = Option.None<HTMLCanvasElement>();

    document.addEventListener("select_area_event", async e => {
        if (!clip.is_some()) return;
        const cl = clip.unwrap()
        if (e.detail === "flip_vertical") {
            await cl.flip_vertical();
            clip = Option.Some(new Clip(cl));
            clip.unwrap().stamp([canvas, ctx], "fill");
        } else if (e.detail === "flip_horizontal") {
            await cl.flip_horizontal();
            clip = Option.Some(new Clip(cl));
            clip.unwrap().stamp([canvas, ctx], "fill");
        } else if (e.detail === "rotate_r90") {
            cl.rotate_r90();
            clip = Option.Some(new Clip(cl));
            clip.unwrap().stamp([canvas, ctx], "fill");
        } else if (e.detail === "rotate_l90") {
            cl.rotate_l90();
            clip = Option.Some(new Clip(cl));
            clip.unwrap().stamp([canvas, ctx], "fill");
        } else if (e.detail === "trash") {
            const layer = layers_arr.val_global()![current_layer.val_global()];
            const { lt_x, lt_y, w, h } = cl.visible_rect(canvas);
            const u = new CanvasPart(lt_x, lt_y, w, h, o_u.unwrap());
            const r = new CanvasPart(lt_x, lt_y, w, h, layer.body);
            const i = current_layer.val_local();
            clip = Option.None();
            undo_stack.push({ i, u, r });
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    })
    return {
        "down": ({ f_x, f_y, zoom, x, y }) => {
            b_x = x;
            b_y = y;
            if (clip.is_some()) {
                const cl = clip.unwrap();
                cl.resize = cl.check_resize({ f_x, f_y, zoom, })
            }
            if (clip.is_some()
                && (clip.unwrap().x <= x && x <= clip.unwrap().x + clip.unwrap().w - 1
                    && clip.unwrap().y <= y && y <= clip.unwrap().y + clip.unwrap().h - 1
                    || clip.unwrap().resize.is)
            ) {
                const cl = clip.unwrap();
                cl.stamp([canvas, ctx], "stroke", [cl.x + x - b_x, cl.y + y - b_y])
            } else if (clip.is_some()) {
                const layer = layers_arr.val_global()![current_layer.val_global()];
                Clip.release_with_undo_stack([clip, layer, layers_arr, current_layer.val_local(), ctx, canvas, o_u.unwrap(), undo_stack, file_state])
                clip = Option.None();
                is_try_clipping = false;
                console.log(clip)
            } else { }
        },
        "tool_move": ({ x, y }) => {
            if (clip.is_some() && clip.unwrap().resize.is) {
                const cl = clip.unwrap();
                const w = (n => 0 < n ? n : n - 1)(cl.resize.r ? x - cl.x : cl.resize.l ? cl.x - x + cl.w : cl.w);
                const h = (n => 0 < n ? n : n - 1)(cl.resize.b ? y - cl.y : cl.resize.t ? cl.y - y + cl.h : cl.h);
                const [n_canvas, n_ctx] = create_canvas({ width: Math.abs(w), height: Math.abs(h) })
                const lt_x = cl.resize.r && w < 0 ? cl.x + w + 1
                    : cl.resize.l && 0 < w ? x
                        : cl.resize.l && w < 0 ? cl.x + cl.w - 1
                            : cl.x;
                const lt_y = cl.resize.b && h < 0 ? cl.y + h + 1
                    : cl.resize.t && 0 < h ? y
                        : cl.resize.t && h < 0 ? cl.y + cl.h - 1
                            : cl.y;
                n_ctx.imageSmoothingEnabled = false;
                n_ctx.scale(w / cl.w, h / cl.h);
                n_ctx.drawImage(cl.canvas, 0 > w ? -cl.w : 0, 0 > h ? -cl.h : 0,);
                n_ctx.restore();
                cl.stamp([canvas, ctx], "stroke", [lt_x, lt_y], n_canvas);
            } else if (clip.is_some()) {
                const cl = clip.unwrap();
                cl.stamp([canvas, ctx], "stroke", [cl.x + x - b_x, cl.y + y - b_y])
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
            if (clip.is_some() && clip.unwrap().resize.is) {
                const cl = clip.unwrap();
                const w = (n => 0 < n ? n : n - 1)(cl.resize.r ? x - cl.x : cl.resize.l ? cl.x - x + cl.w : cl.w);
                const h = (n => 0 < n ? n : n - 1)(cl.resize.b ? y - cl.y : cl.resize.t ? cl.y - y + cl.h : cl.h);
                const [n_canvas, n_ctx] = create_canvas({ width: Math.abs(w), height: Math.abs(h) })
                const lt_x = cl.resize.r && w < 0 ? cl.x + w + 1
                    : cl.resize.l && 0 < w ? x
                        : cl.resize.l && w < 0 ? cl.x + cl.w - 1
                            : cl.x;
                const lt_y = cl.resize.b && h < 0 ? cl.y + h + 1
                    : cl.resize.t && 0 < h ? y
                        : cl.resize.t && h < 0 ? cl.y + cl.h - 1
                            : cl.y;
                n_ctx.imageSmoothingEnabled = false;
                n_ctx.scale(w / cl.w, h / cl.h);
                n_ctx.drawImage(cl.canvas, 0 > w ? -cl.w : 0, 0 > h ? -cl.h : 0,);
                n_ctx.restore();
                cl.x = lt_x;
                cl.y = lt_y;
                cl.canvas = n_canvas;
                cl.ctx = n_ctx;
                cl.w = Math.abs(w);
                cl.h = Math.abs(h);
                cl.stamp([canvas, ctx], "fill")
                clip = Option.Some(new Clip(cl));
            } else if (clip.is_some()) {
                const cl = clip.unwrap();
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                clip = Option.Some(new Clip({ ...cl, x: cl.x + x - b_x, y: cl.y + y - b_y }));
                clip.unwrap().stamp([canvas, ctx], "fill");
                file_state.set(_=>({..._, saved: false}));
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
                clip = Option.Some(new Clip({
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
                }));
                const cl = clip.unwrap();
                cl.stamp([canvas, ctx], "fill");
                o_u = Option.Some(create_canvas(layer.body, true)[0]);
                layer.ctx.clearRect(lt_x, lt_y, rb_x - lt_x + 1, rb_y - lt_y + 1);
                layer.preview_update();
                layers_arr.set([...layers_arr.val_local()!]);
                is_try_clipping = false;
                file_state.set(_ => ({..._, saved: false }));
            }
        },
        "move": ({ f_x, f_y, zoom, x, y }) => {
            if (clip.is_some()) {
                const cl = clip.unwrap();
                const m = cl.check_resize({ f_x, f_y, zoom });
                if (m.r && m.t || m.l && m.b) document.body.style.cursor = "nesw-resize"
                else if (m.r && m.b || m.l && m.t) document.body.style.cursor = "nwse-resize"
                else if (m.r || m.l) document.body.style.cursor = "ew-resize";
                else if (m.b || m.t) document.body.style.cursor = "ns-resize";
                else document.body.style.cursor = "";
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "#5fe07544";
                ctx.fillRect(x, y, 1, 1);
            }
        },
        "on_end": () => {
            need_on_end.set(true);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            clip.on_some(_ => {
                const layer = layers_arr.val_global()![current_layer.val_global()];
                Clip.release_with_undo_stack([clip, layer, layers_arr, current_layer.val_local(), ctx, canvas, o_u.unwrap(), undo_stack, file_state])
                clip = Option.None();
            });
            prev_layer_i = Option.Some(current_layer.val_local());
        },
        "on_start": () => {
            prev_layer_i = Option.Some(current_layer.val_local());
        },
        "on_canvas_change": () => {
            const prev_layer = layers_arr.val_global()![prev_layer_i.unwrap_or(0)];
            clip.on_some(cl => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                prev_layer.ctx.drawImage(cl.canvas, cl.x, cl.y);
                prev_layer.preview_update();
                layers_arr.set([...layers_arr.val_local()!]);
                clip = Option.None();
            });
        },
        "on_ctrl_a": () => {
            need_on_end.set(false);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const layer = layers_arr.val_global()![current_layer.val_global()];
            Clip.release([clip, layer, layers_arr]);
            clip = Option.None();
            console.log(layer);
            const [cl_canvas, cl_ctx] = create_canvas(layer.body, true);
            clip = Option.Some(new Clip({
                lt_x: 0,
                lt_y: 0,
                rb_x: canvas.width,
                rb_y: canvas.height,
                x: 0,
                y: 0,
                w: canvas.width,
                h: canvas.height,
                canvas: cl_canvas,
                ctx: cl_ctx
            }));
            const cl = clip.unwrap();
            cl.stamp([canvas, ctx], "fill");
            o_u = Option.Some(create_canvas(layer.body, true)[0]);
            cl.cut([layer, layers_arr, file_state]);
        },
        "on_ctrl_c": async () => {
            if (!clip.is_some()) return;
            const cl = clip.unwrap();
            const data_url = cl.canvas.toDataURL('image/png');
            const blob = await (await fetch(data_url)).blob();
            const clipboard_item = new ClipboardItem({
                [blob.type]: blob
            });
            await Result.from_try_catch_async(async () => await navigator.clipboard.write([clipboard_item]));
            URL.revokeObjectURL(data_url);
        },
        "on_ctrl_v": async () => {
            const layer = layers_arr.val_global()![current_layer.val_global()];
            clip.on_some(() => {
                const layer = layers_arr.val_global()![current_layer.val_global()];
                Clip.release_with_undo_stack([clip, layer, layers_arr, current_layer.val_local(), ctx, canvas, o_u.unwrap(), undo_stack, file_state])
                clip = Option.None();
            });
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const items_res = await Result.from_try_catch_async(async () => await navigator.clipboard.read());
            if (!items_res.is_ok()) return;
            const items = items_res.unwrap()
            for (const item of items) {
                const types = item.types;
                if (!(types.includes('image/png') || types.includes('image/jpeg'))) continue;
                const blob_res = await Result.from_try_catch_async(async () => await item.getType('image/png')); await item.getType('image/png');
                if (!blob_res.is_ok()) return;
                const blob = blob_res.unwrap();
                const image = await createImageBitmap(blob);
                const [cl_canvas, cl_ctx] = create_canvas(image, true);
                clip = Option.Some(new Clip({
                    lt_x: 0,
                    lt_y: 0,
                    rb_x: image.width,
                    rb_y: image.height,
                    x: 0,
                    y: 0,
                    w: image.width,
                    h: image.height,
                    canvas: cl_canvas,
                    ctx: cl_ctx
                }));
                image.close();
                o_u = Option.Some(create_canvas(layer.body, true)[0]);
                const cl = clip.unwrap();
                cl.stamp([canvas, ctx], "fill");
                break;
            }
        },
        "on_ctrl_x": async () => {
            if (!clip.is_some()) return;
            const cl = clip.unwrap();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            clip = Option.None();
            const layer = layers_arr.val_global()![current_layer.val_global()];
            const { lt_x, lt_y, w, h } = cl.visible_rect(canvas)
            const i = current_layer.val_local();
            const u = new CanvasPart(lt_x, lt_y, w, h, o_u.unwrap());
            const r = new CanvasPart(lt_x, lt_y, w, h, layer.body);
            undo_stack.push({ i, u, r });
            file_state.set(_=>({..._, saved: false}));
            const data_url = cl.canvas.toDataURL('image/png');
            const blob = await (await fetch(data_url)).blob();
            const clipboard_item = new ClipboardItem({
                [blob.type]: blob
            });
            await Result.from_try_catch_async(async () => await navigator.clipboard.write([clipboard_item]));
        },
        "on_arrow_down": ({ kind }) => {
            if (!clip.is_some()) return;
            const cl = clip.unwrap();
            if (kind === "up") {
                cl.y -= 1;
            } else if (kind === "down") {
                cl.y += 1;
            } else if (kind === "right") {
                cl.x += 1;
            } else if (kind === "left") {
                cl.x -= 1;
            }
            cl.stamp([canvas, ctx], "stroke");
            clip = Option.Some(new Clip(cl));
        },
        "on_arrow_up": ({ }) => {
            if (!clip.is_some()) return;
            const cl = clip.unwrap();
            cl.stamp([canvas, ctx], "fill");
        }
    }
}

class Clip {
    start: ClipRect;
    x: number;
    y: number;
    w: number;
    h: number;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    resize: { r: boolean, l: boolean, t: boolean, b: boolean, is: boolean };
    constructor(cl: ClipInit)
    constructor(cl: ClassProps<Clip>)
    constructor(cl: ClipInit | ClassProps<Clip>) {
        if ("start" in cl) {
            this.start = cl.start;
            this.x = cl.x;
            this.y = cl.y;
            this.w = cl.w;
            this.h = cl.h;
            this.canvas = cl.canvas;
            this.ctx = cl.ctx;
            this.resize = cl.resize;
        } else {
            this.start = {
                lt_x: cl.lt_x,
                lt_y: cl.lt_y,
                rb_x: cl.rb_x,
                rb_y: cl.rb_y,
            }
            this.x = cl.x;
            this.y = cl.y;
            this.w = cl.w;
            this.h = cl.h;
            this.canvas = cl.canvas;
            this.ctx = cl.ctx;
            this.resize = cl.resize ?? { r: false, l: false, t: false, b: false, is: false };
        }
    }
    rotate_r90() {
        const [canvas, ctx] = create_canvas({ width: this.h, height: this.w });
        ctx.save();
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(this.canvas, 0, -this.h);
        ctx.restore();
        const center_x = this.x + Math.floor(this.w / 2);
        const center_y = this.y + Math.floor(this.h / 2);
        this.x = center_x - Math.floor(this.h / 2);
        this.y = center_y - Math.floor(this.w / 2);
        this.canvas = canvas;
        this.ctx = ctx;
        [this.w, this.h] = [this.h, this.w];
    }
    rotate_l90() {
        const [canvas, ctx] = create_canvas({ width: this.h, height: this.w });
        ctx.save();
        ctx.rotate(-Math.PI / 2);
        ctx.drawImage(this.canvas, -this.w, 0);
        ctx.restore();
        const center_x = this.x + Math.floor(this.w / 2);
        const center_y = this.y + Math.floor(this.h / 2);
        this.x = center_x - Math.floor(this.h / 2);
        this.y = center_y - Math.floor(this.w / 2);
        this.canvas = canvas;
        this.ctx = ctx;
        [this.w, this.h] = [this.h, this.w];
    }
    async flip_horizontal() {
        const img = await createImageBitmap(this.canvas);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.scale(1, -1)
        this.ctx.drawImage(img, 0, -this.canvas.height);
        this.ctx.restore();
        img.close();
    }
    async flip_vertical() {
        const img = await createImageBitmap(this.canvas);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.scale(-1, 1)
        this.ctx.drawImage(img, -this.canvas.width, 0);
        this.ctx.restore();
        img.close();
    }
    stamp(
        [canvas, ctx]: [HTMLCanvasElement, CanvasRenderingContext2D],
        surround: "none" | "stroke" | "fill" = "none",
        xy: [number, number] | [undefined, undefined] = [undefined, undefined],
        img?: CanvasImageSource & { width: number, height: number }
    ) {
        const [x, y] = xy;
        const [w, h] = [img?.width ?? this.w, img?.height ?? this.h];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img ?? this.canvas, x ?? this.x, y ?? this.y);
        if (surround === "stroke") {
            ctx.strokeStyle = "#5fe07544";
            ctx.strokeRect((x ?? this.x) + 0.5, (y ?? this.y) + 0.5, w - 1, h - 1);
        } else if (surround === "fill") {
            ctx.fillStyle = "#5fe07544";
            ctx.fillRect(x ?? this.x, y ?? this.y, w, h);
        }
    }
    visible_rect(canvas: HTMLCanvasElement) {
        const lt_x = Math.max(0, Math.min(this.start.lt_x, this.x));
        const lt_y = Math.max(0, Math.min(this.start.lt_y, this.y));
        const rb_x = Math.min(Math.max(this.start.rb_x, this.x + this.w), canvas.width,);
        const rb_y = Math.min(Math.max(this.start.rb_y, this.y + this.h), canvas.height);
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
    cut([layer, layers_arr, file_state]: [Layer, State<Layer[] | undefined>, State<FileStateT>]) {
        layer.ctx.clearRect(this.x, this.y, this.w, this.h);
        layer.preview_update();
        layers_arr.set([...layers_arr.val_local()!]);
        file_state.set(_ => ({ ..._, saved: false }));
    }
    check_resize({ f_x, f_y, zoom }: { f_x: number, f_y: number, zoom: number }) {
        const r = Math.abs(f_x - (this.x + this.w)) < 4 / zoom && (Math.abs(this.y + this.h / 2 - f_y) < this.h / 2 + 4 / zoom);
        const l = Math.abs(f_x - this.x) < 4 / zoom && (Math.abs(this.y + this.h / 2 - f_y) < this.h / 2 + 4 / zoom);
        const b = Math.abs(f_y - (this.y + this.h)) < 4 / zoom && (Math.abs(this.x + this.w / 2 - f_x) < this.w / 2 + 4 / zoom);
        const t = Math.abs(f_y - this.y) < 4 / zoom && (Math.abs(this.x + this.w / 2 - f_x) < this.w / 2 + 4 / zoom);
        return { r, l, b, t, is: r || l || b || t, }
    }
    static release([clip, layer, layers_arr]: [Option<Clip>, Layer, State<Layer[] | undefined>]) {
        clip.on_some(cl => {
            layer.ctx.drawImage(cl.canvas, cl.x, cl.y);
            layer.preview_update();
            layers_arr.set([...layers_arr.val_local()!]);
        });
        clip = Option.None()
    }
    static release_with_undo_stack([clip, layer, layers_arr, current_layer, ctx, canvas, o_u, undo_stack, file_state]
        : [Option<Clip>, Layer, State<Layer[] | undefined>, number, CanvasRenderingContext2D, HTMLCanvasElement, HTMLCanvasElement, UndoStack, State<FileStateT>]) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const cl = clip.unwrap();
        const i = current_layer;
        const { lt_x, lt_y, w, h } = cl.visible_rect(canvas);
        const u = new CanvasPart(lt_x, lt_y, w, h, o_u);
        layer.ctx.drawImage(cl.canvas, cl.x, cl.y);
        const r = new CanvasPart(lt_x, lt_y, w, h, layer.body);
        layer.preview_update();
        layers_arr.set([...layers_arr.val_local()!]);
        undo_stack.push({ i, u, r });
        clip = Option.None();
        
        file_state.set(_ => ({ ..._, saved: false }));
    }
}

type ClipInit = {
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
    resize?: { r: boolean, l: boolean, t: boolean, b: boolean, is: boolean };
}

type ClipRect = {
    lt_x: number;
    lt_y: number;
    rb_x: number;
    rb_y: number;
}

type InstanceProps<T> = {
    [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

type ClassProps<T> = Pick<T, InstanceProps<T>>;