import { argsT, bresenham, toolT } from ".";

export const line_tool = ({
    canvas,
    ctx,
    brush_color,
    brush_thickness,
    layers_arr,
    current_layer
}: argsT): toolT => {
    let b_x = 0;
    let b_y = 0;
    return {
        "down": ({x, y}) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            b_x = x;
            b_y = y;
        },
        "tool_move": ({x, y}) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const color = brush_color.val_global();
            const thickness = brush_thickness.val_global();
            const shift = Math.floor((thickness) / 2);
            ctx.fillStyle = color;
            bresenham((x, y) => {
                ctx.fillRect(x - shift, y - shift, thickness, thickness);
            }, b_x, b_y, x, y);
        },
        "up": ({x, y, was_down}) => {
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
            layer.ctx.drawImage(canvas, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            layer.preview_update();
            layers_arr.set([...layers_arr.val_local()!]);
        },
        "move": ({x, y}) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const color = brush_color.val_global();
            const thickness = brush_thickness.val_global();
            const shift = Math.floor((thickness) / 2);
            ctx.fillStyle = color;
            ctx.fillRect(x - shift, y - shift, thickness, thickness);
        },
    }
};