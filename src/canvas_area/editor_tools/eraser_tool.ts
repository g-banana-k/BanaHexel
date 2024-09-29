import { argsT, bresenham, toolT } from ".";
import { Option } from "../../common/utils";
import { CanvasPart, clone_canvas } from "../undo";

export const eraser_tool = ({
    canvas,
    ctx,
    eraser_thickness,
    layers_arr,
    current_layer,
    undo_stack
}: argsT): toolT => {
    let b_x = 0;
    let b_y = 0;
    let lt_x = 0;
    let lt_y = 0;
    let rb_x = 0;
    let rb_y = 0;
    let down_canvas = Option.None<HTMLCanvasElement>();
    return {
        "down": ({ x, y }) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const layer = layers_arr.val_global()![current_layer.val_global()];
            const thickness = eraser_thickness.val_global();
            const shift = Math.floor((thickness) / 2);
            b_x = x;
            b_y = y;
            down_canvas = Option.Some(clone_canvas(layer.body));
            lt_x = x;
            lt_y = y;
            rb_x = x;
            rb_y = y;
            layer.ctx.clearRect(x - shift, y - shift, thickness, thickness);
        },
        "tool_move": ({ x, y }) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const layer = layers_arr.val_global()![current_layer.val_local()];
            const thickness = eraser_thickness.val_global();
            const shift = Math.floor((thickness) / 2);
            bresenham((x, y) => {
                layer.ctx.clearRect(x - shift, y - shift, thickness, thickness);
            }, b_x, b_y, x, y);
            b_x = x;
            b_y = y;
            lt_x = Math.min(lt_x, x);
            lt_y = Math.min(lt_y, y);
            rb_x = Math.max(rb_x, x);
            rb_y = Math.max(rb_y, y);
        },
        "up": ({ x, y, was_down }) => {
            if (!was_down) return;
            const thickness = eraser_thickness.val_global();
            const layer = layers_arr.val_global()![current_layer.val_global()];
            const i = current_layer.val_local();
            const s_x = Math.max(lt_x - Math.floor(thickness / 2), 0);
            const s_y = Math.max(lt_y - Math.floor(thickness / 2), 0);
            const w = Math.min(rb_x + Math.ceil(thickness / 2), layer.body.width) - s_x + 1;
            const h = Math.min(rb_y + Math.ceil(thickness / 2), layer.body.width) - s_y + 1;
            const u = new CanvasPart(s_x, s_y, w, h, down_canvas.unwrap());
            const r = new CanvasPart(s_x, s_y, w, h, layer.body);
            undo_stack.push({ i, u, r });
            layer.preview_update();
            layers_arr.set([...layers_arr.val_local()!]);
            const shift = Math.floor((thickness) / 2);
            ctx.fillStyle = "#fff4";
            ctx.fillRect(x - shift, y - shift, thickness, thickness);
            down_canvas = Option.None();
        },
        "move": ({ x, y }) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const thickness = eraser_thickness.val_global();
            const shift = Math.floor((thickness) / 2);
            ctx.fillStyle = "#fff4";
            ctx.fillRect(x - shift, y - shift, thickness, thickness);
        },
        "on_end": () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        },
        "on_ctrl_y": () => {
            down_canvas.on_some(c => {
                const layer = layers_arr.val_global()![current_layer.val_global()];
                layer.ctx.drawImage(c, 0, 0);
                Option.Some<0>(0);
            })
            return !down_canvas.is_some();
        },
        "on_ctrl_z": () => {
            down_canvas.on_some(c => {
                const layer = layers_arr.val_global()![current_layer.val_global()];
                layer.ctx.drawImage(c, 0, 0);
                Option.Some<0>(0);
            });
            return !down_canvas.is_some();
        },
    }
};