import { argsT, toolT } from ".";

export const rect_tools = ({
    canvas,
    ctx,
    brush_color,
    layers_arr,
    current_layer
}: argsT): toolT => {
    let b_x = 0;
    let b_y = 0;
    return {
        "down": (x, y) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            b_x = x;
            b_y = y;
        },
        "tool_move": (x, y) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const color = brush_color.val_global();
            ctx.fillStyle = color;
            const w = x - b_x + (b_x <= x ? 1 : 0);
            const h = y - b_y + (b_y <= y ? 1 : 0);
            const s_x = b_x + (b_x > x ? 1 : 0);
            const s_y = b_y + (b_y > y ? 1 : 0);
            ctx.fillRect(s_x, s_y, w, h);
        },
        "up": (x, y, was_down) => {
            if (!was_down) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const color = brush_color.val_global();
            ctx.fillStyle = color;
            const w = x - b_x + (b_x <= x ? 1 : 0);
            const h = y - b_y + (b_y <= y ? 1 : 0);
            const s_x = b_x + (b_x > x ? 1 : 0);
            const s_y = b_y + (b_y > y ? 1 : 0);
            ctx.fillRect(s_x, s_y, w, h);
            const layer = layers_arr.val_global()![current_layer.val_global()];
            layer.ctx.drawImage(canvas, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            layer.preview_update();
            layers_arr.set([...layers_arr.val_local()!]);
        },
        "move": (x, y) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const color = brush_color.val_global();
            ctx.fillStyle = color;
            ctx.fillRect(x, y, 1, 1);
        },
    }
};