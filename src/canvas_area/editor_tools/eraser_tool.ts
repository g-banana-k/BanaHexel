import { argsT, bresenham, toolT } from ".";

export const eraser_tools = ({
    canvas,
    ctx,
    eraser_thickness,
    layers_arr,
    current_layer
}: argsT): toolT => {
    let b_x = 0;
    let b_y = 0;
    return {
        "down": (x, y) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const layer = layers_arr.val_global()![current_layer.val_global()];
            const thickness = eraser_thickness.val_global();
            const shift = Math.floor((thickness) / 2);
            layer.ctx.clearRect(x - shift, y - shift, thickness, thickness);
            b_x = x;
            b_y = y;
        },
        "tool_move": (x, y) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const layer = layers_arr.val_global()![current_layer.val_local()];
            const thickness = eraser_thickness.val_global();
            const shift = Math.floor((thickness) / 2);
            bresenham((x, y) => {
                layer.ctx.clearRect(x - shift, y - shift, thickness, thickness);
            }, b_x, b_y, x, y);
            b_x = x;
            b_y = y;
        },
        "up": (x, y) => {
            const layer = layers_arr.val_global()![current_layer.val_local()];
            layer.preview_update();
            layers_arr.set([...layers_arr.val_local()!]);
            const thickness = eraser_thickness.val_global();
            const shift = Math.floor((thickness) / 2);
            ctx.fillStyle = "#fff4";
            ctx.fillRect(x - shift, y - shift, thickness, thickness);
        },
        "move": (x, y) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const thickness = eraser_thickness.val_global();
            const shift = Math.floor((thickness) / 2);
            ctx.fillStyle = "#fff4";
            ctx.fillRect(x - shift, y - shift, thickness, thickness);
        },
    }
};