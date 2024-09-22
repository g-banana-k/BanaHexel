import { argsT, toolT } from ".";
import { Option } from "../../common/utils";

export const select_tools = ({
    canvas,
    ctx,
    layers_arr,
    current_layer
}: argsT): toolT => {
    let b_x = 0;
    let b_y = 0;
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
        "down": (x, y) => {
            if (clipping.is_some()
                && clipping.unwrap().x <= x && x <= clipping.unwrap().x + clipping.unwrap().rb_x - clipping.unwrap().lt_x
                && clipping.unwrap().y <= y && y <= clipping.unwrap().y + clipping.unwrap().rb_y - clipping.unwrap().lt_y
            ) {
            } else if (clipping.is_some()) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const cl = clipping.unwrap();
                const layer = layers_arr.val_global()![current_layer.val_global()];
                layer.ctx.drawImage(cl.canvas, cl.x, cl.y);
                layer.preview_update();
                layers_arr.set([...layers_arr.val_local()!]);
                clipping = Option.None();
            } else {
            }
            b_x = x;
            b_y = y;
            console.log(b_x, b_y);
        },
        "tool_move": (x, y) => {
            if (clipping.is_some()) {
                const cl = clipping.unwrap();
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(cl.canvas, cl.x + x - b_x, cl.y + y - b_y);
                ctx.strokeStyle = "#5fe07588";
                ctx.strokeRect(cl.x + x - b_x, cl.y + y - b_y, cl.rb_x - cl.lt_x + 1, cl.rb_y - cl.lt_y + 1)
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "#fff4";
                const [lt_x, rb_x] = b_x < x ? [b_x, x] : [x, b_x];
                const [lt_y, rb_y] = b_y < y ? [b_y, y] : [y, b_y];
                ctx.fillRect(lt_x, lt_y, rb_x - lt_x + 1, rb_y - lt_y + 1);
            }
        },
        "up": (x, y, was_down) => {
            if (!was_down) return;
            if (clipping.is_some()) {
                const cl = clipping.unwrap();
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(cl.canvas, cl.x + x - b_x, cl.y + y - b_y);
                clipping = Option.Some({ ...cl, x: cl.x + x - b_x, y: cl.y + y - b_y });
                ctx.strokeStyle = "#5fe07588";
                ctx.strokeRect(cl.x + x - b_x, cl.y + y - b_y, cl.rb_x - cl.lt_x + 1, cl.rb_y - cl.lt_y + 1)
            } else {
                ctx.fillStyle = "#fff4";
                const [lt_x, rb_x] = b_x < x ? [b_x, x] : [x, b_x];
                const [lt_y, rb_y] = b_y < y ? [b_y, y] : [y, b_y];
                ctx.fillRect(lt_x, lt_y, rb_x - lt_x + 1, rb_y - lt_y + 1);
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
                ctx.strokeStyle = "#5fe07588";
                ctx.strokeRect(cl.x + x - b_x, cl.y + y - b_y, cl.rb_x - cl.lt_x + 1, cl.rb_y - cl.lt_y + 1)
                layer.ctx.clearRect(lt_x, lt_y, rb_x - lt_x + 1, rb_y - lt_y + 1);
                layer.preview_update();
                layers_arr.set([...layers_arr.val_local()!]);
            }
        },
        "move": (x, y) => {
            if (clipping.is_some()) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#fff4";
            ctx.fillRect(x, y, 1, 1);
        },
    }
};