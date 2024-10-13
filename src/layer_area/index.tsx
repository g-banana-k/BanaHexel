import { useEffect, useRef } from "react";
import "./index.css";
import { useRecoilState, useRecoilValue } from "recoil";
import { canvas_size_state, current_layer_state, layer_arr_state } from "../app";
import { MoveDown, MoveUp, Plus, X } from "lucide-react";
import { Layer } from "../data";

export const LayerArea = () => {
    const [layer_arr, set_layer_arr] = useRecoilState(layer_arr_state);
    const [current_layer, set_current_layer] = useRecoilState(current_layer_state);
    const canvas_size = useRecoilValue(canvas_size_state);

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
                            className="layer_thumbnail_preview_container"
                            onClick={() => set_current_layer(i)}
                        />
                        <div
                            className="layer_thumbnail_delete_button"
                            onClick={() => {
                                layer_arr![i].delete();
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
