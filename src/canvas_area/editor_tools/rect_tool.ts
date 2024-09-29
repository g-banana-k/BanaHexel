import { argsT, toolT } from ".";
import { CanvasPart } from "../undo";

export const rect_tool = ({
    canvas,
    ctx,
    brush_color,
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
            ctx.fillStyle = color;
            const w = Math.abs(x - b_x) + 1;
            const h = Math.abs(y - b_y) + 1;
            const s_x = Math.min(x, b_x);
            const s_y = Math.min(y, b_y);
            ctx.fillRect(s_x, s_y, w, h);
        },
        "up": ({ x, y, was_down }) => {
            if (!was_down) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const color = brush_color.val_global();
            ctx.fillStyle = color;
            const s_x = Math.max(0, Math.min(x, b_x));
            const s_y = Math.max(0, Math.min(y, b_y));
            const w = Math.max(canvas.width, Math.min(x, b_x)) - s_x + 1;
            const h = Math.max(canvas.height, Math.min(y, b_y)) - s_y + 1;
            ctx.fillRect(s_x, s_y, w, h);
            const layer = layers_arr.val_global()![current_layer.val_global()];
            const i = current_layer.val_local();
            const u = new CanvasPart(s_x, s_y, w, h, layer.body);
            layer.ctx.drawImage(canvas, 0, 0);
            const r = new CanvasPart(s_x, s_y, w, h, layer.body);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            layer.preview_update();
            layers_arr.set([...layers_arr.val_local()!]);
            undo_stack.push({ i, u, r });
        },
        "move": ({ x, y }) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const color = brush_color.val_global();
            ctx.fillStyle = color;
            ctx.fillRect(x, y, 1, 1);
        },
        "on_end": () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
};