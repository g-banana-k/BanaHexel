import { argsT, toolT } from ".";

export const stamp_tool = ({
    canvas,
    ctx,
    brush_color,
    brush_thickness,
    layers_arr,
    current_layer
}: argsT): toolT => {
    return {
        "down": ({ x, y }) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const color = brush_color.val_global();
            const thickness = brush_thickness.val_global();
            const shift = Math.floor((thickness) / 2);
            const layer = layers_arr.val_global()![current_layer.val_global()];
            layer.ctx.fillStyle = color;
            layer.ctx.fillRect(x - shift, y - shift, thickness, thickness);
            layer.preview_update();
            layers_arr.set([...layers_arr.val_local()!]);
        },
        "tool_move": ({ x, y }) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const color = brush_color.val_global();
            const thickness = brush_thickness.val_global();
            const shift = Math.floor((thickness) / 2);
            ctx.fillStyle = color;
            ctx.fillRect(x - shift, y - shift, thickness, thickness);
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