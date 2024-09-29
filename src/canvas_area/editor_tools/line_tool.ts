import { argsT, bresenham, toolT } from ".";
import { CanvasPart } from "../undo";

export const line_tool = ({
    canvas,
    ctx,
    brush_color,
    brush_thickness,
    layers_arr,
    current_layer,
    undo_stack,
}: argsT): toolT => {
    let b_x = 0;
    let b_y = 0;
    return {
        "down": ({ x, y }) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            b_x = x;
            b_y = y;
        },
        "tool_move": ({ x, y }) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const color = brush_color.val_global();
            const thickness = brush_thickness.val_global();
            const shift = Math.floor((thickness) / 2);
            ctx.fillStyle = color;
            bresenham((x, y) => {
                ctx.fillRect(x - shift, y - shift, thickness, thickness);
            }, b_x, b_y, x, y);
        },
        "up": ({ x, y, was_down }) => {
            if (!was_down) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const color = brush_color.val_global();
            const thickness = brush_thickness.val_global();
            const shift = Math.floor((thickness) / 2);
            ctx.fillStyle = color;
            bresenham((x, y) => {
                ctx.fillRect(x - shift, y - shift, thickness, thickness);
            }, b_x, b_y, x, y);
            const layer = layers_arr.val_global()![current_layer.val_global()];
            const i = current_layer.val_local();
            const s_x = Math.max(0, Math.min(b_x - shift, x - shift));
            const s_y = Math.max(0, Math.min(b_y - shift, y - shift));
            const w = Math.min(canvas.width, Math.max(b_x + Math.ceil(thickness / 2), x + Math.ceil(thickness / 2)));
            const h = Math.min(canvas.height, Math.max(b_y + Math.ceil(thickness / 2), y + Math.ceil(thickness / 2)));
            const u = new CanvasPart(s_x, s_y, w, h, layer.body);
            layer.ctx.drawImage(canvas, 0, 0);
            const r = new CanvasPart(s_x, s_y, w, h, layer.body);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            layer.preview_update();
            layers_arr.set([...layers_arr.val_local()!]);
            undo_stack.push({ i, u, r })
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