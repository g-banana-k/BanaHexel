import { useEffect, useRef } from "react";
import "./index.css";
import { useAtom, useAtomValue } from "jotai";
import { MoveDown, MoveUp, Plus, X } from "lucide-react";
import { canvas_size_atom, current_layer_atom, layer_arr_atom } from "../../app";
import { Layer } from "../../logic/data";
import { useSetContextMenu } from "../context_menu";

export const LayerArea = () => {
    const [layer_arr, set_layer_arr] = useAtom(layer_arr_atom);
    const [current_layer, set_current_layer] = useAtom(current_layer_atom);
    const canvas_size = useAtomValue(canvas_size_atom);

    const [set_context_menu_contents, set_context_menu_position, set_context_menu_open,] = useSetContextMenu();

    const div_refs = useRef<(HTMLDivElement | null)[]>([]);
    useEffect(() => {
        layer_arr?.forEach((l, i) => {
            const preview_div = div_refs.current[i];
            if (!preview_div) return;
            preview_div.innerHTML = "";

            l.preview.classList.add("layer_thumbnail_preview");
            preview_div.appendChild(l.preview);

            if (i === current_layer) {
                preview_div.classList.add("layer_thumbnail_selected");
            } else {
                preview_div.classList.remove("layer_thumbnail_selected");
            }
        });
    }, [layer_arr, current_layer]);

    return (
        <div id="layer_area">
            <div id="layer_list">
                {layer_arr?.map((l, i) => (
                    <div key={l.uuid} className="layer_thumbnail" >
                        <div
                            ref={(el) => (div_refs.current[i] = el)}
                            className="layer_thumbnail_preview_container has_own_context_menu"
                            onClick={() => set_current_layer(i)}
                            onContextMenu={e => {
                                e.preventDefault();
                                set_context_menu_open(true);
                                set_context_menu_position({ x: e.clientX, y: e.clientY })
                                set_context_menu_contents([
                                    <div
                                        key={crypto.randomUUID()}
                                        className="context_menu_content"
                                        onClick={() => {
                                            if (i === 0) return;
                                            layer_arr[i - 1].ctx.drawImage(layer_arr[i].body, 0, 0);
                                            const l = [...layer_arr.filter((_, j) => j !== i)];
                                            if (current_layer < i - 1) { }
                                            else if (i - 1 <= current_layer && current_layer < i + 1) set_current_layer(i - 1)
                                            else set_current_layer(current_layer - 1);
                                            l[i - 1].preview_update();
                                            set_layer_arr(l);
                                        }}
                                    >上にマージ</div>,
                                    <div
                                        key={crypto.randomUUID()}
                                        className="context_menu_content"
                                        onClick={() => {
                                            if (i === layer_arr.length - 1) return;
                                            layer_arr[i + 1].ctx.drawImage(layer_arr[i].body, 0, 0);
                                            const l = [...layer_arr.filter((_, j) => j !== i)];
                                            if (current_layer < i - 1) { }
                                            else if (i - 1 <= current_layer && current_layer < i + 1) set_current_layer(i)
                                            else set_current_layer(current_layer - 1);
                                            l[i].preview_update();
                                            set_layer_arr(l);
                                        }}
                                    >下にマージ</div>
                                ]);
                            }}
                        />
                        <div
                            className="layer_thumbnail_delete_button"
                            onClick={() => {
                                set_layer_arr(_ => _!.filter((_, j) => j !== i))
                                if (layer_arr.length - 1 <= current_layer) set_current_layer(_ => _ - 1);
                            }}
                            style={{
                                display: layer_arr.length !== 1 ? "block" : "none",
                            }}
                        >
                            <X size={16} />
                        </div>
                        <div
                            className="layer_thumbnail_move_button_area"
                            style={{
                                display: layer_arr.length !== 1 ? "block" : "none",
                            }}
                        >
                            <div className="layer_thumbnail_move_button" onClick={() => {
                                if (i === 0) return;
                                const l = [...layer_arr];
                                if (i === current_layer) { set_current_layer(i - 1); }
                                else if (i - 1 === current_layer) { set_current_layer(i); }
                                [l[i], l[i - 1]] = [l[i - 1], l[i]];
                                set_layer_arr(l);
                            }}>    <MoveUp size={16} /></div>
                            <div className="layer_thumbnail_move_button" onClick={() => {
                                set_layer_arr(_ => _!.filter((_, j) => j !== i))
                                if (layer_arr.length - 1 <= current_layer) set_current_layer(_ => _ - 1);
                            }}>     <X size={16} /></div>
                            <div className="layer_thumbnail_move_button" onClick={() => {
                                if (i + 1 === layer_arr.length) return;
                                const l = [...layer_arr];
                                if (i === current_layer) { set_current_layer(i + 1); }
                                else if (i + 1 === current_layer) { set_current_layer(i); }
                                [l[i], l[i + 1]] = [l[i + 1], l[i]];
                                set_layer_arr(l);
                            }}><MoveDown size={16} /></div>
                        </div>
                    </div>
                ))}
            </div>
            <div
                id="layer_add_button"
                onClick={() => {
                    set_layer_arr([...layer_arr!, new Layer(undefined, canvas_size!)]);
                }}
            >
                <Plus size={32} />
            </div>
        </div>
    );
};
