import { argsT, toolT } from ".";
import { CanvasPart } from "../undo";

export const stamp_tool = ({
    canvas,
    ctx,
    brush_color,
    brush_thickness,
    layers_arr,
    current_layer,
    undo_stack,
    file_state,
    need_on_end
}: argsT): toolT => {
    return {
        "down": ({ x, y }) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const color = brush_color.val_global();
            const thickness = brush_thickness.val_global();
            const shift = Math.floor((thickness) / 2);
            const layer = layers_arr.val_global()![current_layer.val_global()];
            layer.ctx.fillStyle = color;
            const i = current_layer.val_local();
            const u = new CanvasPart(x - shift, y - shift, thickness, thickness, layer.body);
            layer.ctx.fillRect(x - shift, y - shift, thickness, thickness);
            const r = new CanvasPart(x - shift, y - shift, thickness, thickness, layer.body);
            undo_stack.push({ i, u, r })
            layer.preview_update();
            layers_arr.set([...layers_arr.val_local()!]);
            file_state.set(_=>({..._, saved:false}));
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
            if(!need_on_end.val_global()) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
};