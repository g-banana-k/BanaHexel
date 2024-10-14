import { argsT, toolT } from ".";
import { code_to_rgba } from "../../common/color_picker";
import { Option, State } from "../../common/utils";
import { Layer } from "../../data";
import { CanvasPart } from "../undo";

export const bucket_tool = ({
    canvas,
    ctx,
    brush_color,
    layers_arr,
    current_layer,
    undo_stack,
    file_state,
    need_on_end
}: argsT): toolT => {
    return {
        "down": ({ x, y, shift }) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const layer = layers_arr.val_global()![current_layer.val_global()];
            const fn = fill({ brush_color, layer, x, y, shift });
            fn.on_some(fn => {
            file_state.set(_ => ({ saving: _.saving, saved: false, has_file: _.has_file }));
                const u = new CanvasPart(0, 0, layer.body.width, layer.body.height, layer.body);
                const i = current_layer.val_local();
                fn();
                const r = new CanvasPart(0, 0, layer.body.width, layer.body.height, layer.body);
                undo_stack.push({ i, u, r });
                layer.preview_update();
                layers_arr.set([...layers_arr.val_local()!]);
            })
        },
        "tool_move": ({ x, y, shift }) => {
            const layer = layers_arr.val_global()![current_layer.val_global()];
            const fn = fill({ brush_color, layer, x, y, shift });
            fn.on_some(fn => {
            file_state.set(_ => ({ saving: _.saving, saved: false, has_file: _.has_file }));
                const u = new CanvasPart(0, 0, layer.body.width, layer.body.height, layer.body);
                const i = current_layer.val_local();
                fn();
                const r = new CanvasPart(0, 0, layer.body.width, layer.body.height, layer.body);
                undo_stack.push({ i, u, r });
                layer.preview_update();
                layers_arr.set([...layers_arr.val_local()!]);
            })
        },
        "up": ({ was_down }) => {
            if (!was_down) return;
            const layer = layers_arr.val_global()![current_layer.val_global()];
            layer.ctx.drawImage(canvas, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            layer.preview_update();
            layers_arr.set([...layers_arr.val_local()!]);
        },
        "move": ({ x, y }) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const color = brush_color.val_global();
            ctx.fillStyle = color;
            ctx.fillRect(x, y, 1, 1);
        },
        "on_end": () => {
            if(!need_on_end.val_global()) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
};

const fill = ({ brush_color, layer, x, y, shift }: { brush_color: State<string>, layer: Layer, x: number, y: number, shift: boolean }): Option<() => void> => {
    const n_color = code_to_rgba(brush_color.val_global());
    const o_color = (a => [a[0], a[1], a[2], a[3]] as [number, number, number, number])(layer.ctx.getImageData(x, y, 1, 1).data);
    if (o_color[0] === n_color[0]
        && o_color[1] === n_color[1]
        && o_color[2] === n_color[2]
        && o_color[3] === n_color[3]
    ) return Option.None()
    else return Option.Some(() => {
        if (!shift) flood_fill({ layer, x, y, n_color, o_color });
        else {
            const s_image_data = layer.ctx.getImageData(0, 0, layer.body.width, layer.body.height);
            const d_image_data = s_image_data;
            for (let x = 0; x < s_image_data.width; x++) {
                for (let y = 0; y < s_image_data.height; y++) {
                    if (matches_color(x, y, s_image_data, o_color)) {
                        set_color(x, y, d_image_data, n_color);
                    }
                }
            }
            layer.ctx.putImageData(d_image_data, 0, 0);
        }
    });
}

const flood_fill = ({ layer, x, y, n_color, o_color }: { layer: Layer, x: number, y: number, n_color: [number, number, number, number], o_color: [number, number, number, number] }) => {
    const s_image_data = layer.ctx.getImageData(0, 0, layer.body.width, layer.body.height);
    const d_image_data = s_image_data;
    const stack = [{ x, y }];
    while (stack.length) {
        const pop = stack.pop()!;
        flood_fill_internal(pop.x, pop.y, s_image_data, d_image_data, n_color, o_color, stack);
    }
    layer.ctx.putImageData(d_image_data, 0, 0);
}

const flood_fill_internal = (
    x: number,
    y: number,
    s_image_data: ImageData,
    d_image_data: ImageData,
    n_color: [number, number, number, number],
    o_color: [number, number, number, number],
    stack: { x: number, y: number }[]
) => {
    while (y > 0 && matches_color(x, y - 1, s_image_data, o_color)) {
        y--;
    }
    let last_l_matched_color = false;
    let last_r_matched_color = false;
    for (; y < s_image_data.height; y++) {
        if (!matches_color(x, y, s_image_data, o_color)) break;
        set_color(x, y, s_image_data, n_color);
        set_color(x, y, d_image_data, n_color);
        if (x > 0) {
            if (matches_color(x - 1, y, s_image_data, o_color)) {
                if (!last_l_matched_color) {
                    stack.push({ x: x - 1, y });
                    last_l_matched_color = true;
                }
            } else {
                last_l_matched_color = false;
            }
        }
        if (x < s_image_data.width - 1) {
            if (matches_color(x + 1, y, s_image_data, o_color)) {
                if (!last_r_matched_color) {
                    stack.push({ x: x + 1, y });
                    last_r_matched_color = true;
                }
            } else {
                last_r_matched_color = false;
            }
        }
    }
};

const matches_color = (x: number, y: number, s_image_data: ImageData, o_color: [number, number, number, number]) => {
    const i = ((y * s_image_data.width) + x) * 4;
    return s_image_data.data[i + 0] === o_color[0]
        && s_image_data.data[i + 1] === o_color[1]
        && s_image_data.data[i + 2] === o_color[2]
        && s_image_data.data[i + 3] === o_color[3];
}

const set_color = (x: number, y: number, d_image_data: ImageData, n_color: [number, number, number, number]) => {
    const index = ((y * d_image_data.width) + x) * 4;
    d_image_data.data[index + 0] = n_color[0];
    d_image_data.data[index + 1] = n_color[1];
    d_image_data.data[index + 2] = n_color[2];
    d_image_data.data[index + 3] = n_color[3];
};
