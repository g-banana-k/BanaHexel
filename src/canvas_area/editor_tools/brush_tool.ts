import { argsT, bresenham, toolT } from ".";
import { CanvasPart } from "../undo";

export const brush_tool = ({
    canvas,
    ctx,
    brush_color,
    brush_thickness,
    layers_arr,
    current_layer,
    undo_stack,
    file_state
}: argsT): toolT => {
    let b_x = 0;
    let b_y = 0;
    let lt_x = 0;
    let lt_y = 0;
    let rb_x = 0;
    let rb_y = 0;
    return {
        "down": ({ x, y }) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const color = brush_color.val_global();
            const thickness = brush_thickness.val_global();
            const shift = Math.floor((thickness) / 2);
            ctx.fillStyle = color;
            ctx.fillRect(x - shift, y - shift, thickness, thickness);
            b_x = x;
            b_y = y;
            lt_x = x;
            lt_y = y;
            rb_x = x;
            rb_y = y;
        },
        "tool_move": ({ x, y }) => {
            const color = brush_color.val_global();
            const thickness = brush_thickness.val_global();
            const shift = Math.floor((thickness) / 2);
            ctx.fillStyle = color;
            bresenham((x, y) => {
                ctx.fillRect(x - shift, y - shift, thickness, thickness);
            }, b_x, b_y, x, y);
            b_x = x;
            b_y = y;
            lt_x = Math.min(lt_x, x);
            lt_y = Math.min(lt_y, y);
            rb_x = Math.max(rb_x, x);
            rb_y = Math.max(rb_y, y);
        },
        "up": ({ was_down }) => {
            if (!was_down) return;
            const thickness = brush_thickness.val_global();
            const layer = layers_arr.val_global()![current_layer.val_global()];
            const i = current_layer.val_local();
            const s_x = Math.max(lt_x - Math.floor(thickness / 2), 0);
            const s_y = Math.max(lt_y - Math.floor(thickness / 2), 0);
            const w = Math.min(rb_x + Math.ceil(thickness / 2), layer.body.width) - s_x + 1;
            const h = Math.min(rb_y + Math.ceil(thickness / 2), layer.body.width) - s_y + 1;
            const u = new CanvasPart(s_x, s_y, w, h, layer.body);
            layer.ctx.drawImage(canvas, 0, 0);
            const r = new CanvasPart(s_x, s_y, w, h, layer.body);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            layer.preview_update();
            layers_arr.set([...layers_arr.val_local()!]);
            undo_stack.push({ i, u, r })
            file_state.set(_ => ({ saving: _.saving, saved: false }));
        },
        "move": ({ x, y }) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const color = brush_color.val_global();
            const thickness = brush_thickness.val_global();
            const shift = Math.floor((thickness) / 2);
            ctx.fillStyle = color;
            ctx.fillRect(x - shift, y - shift, thickness, thickness);
        },
        "on_end": () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
};