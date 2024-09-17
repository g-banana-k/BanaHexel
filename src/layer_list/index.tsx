import { useEffect, useRef } from "react"
import "./index.css"
import { useRecoilState } from "recoil"
import { current_layer_state, layer_arr_state } from "../App"

export const LayerList = () => {
    const [layer_arr, set_layer_arr] =useRecoilState(layer_arr_state);
    const [current_layer, set_current_layer] = useRecoilState(current_layer_state);
    return (<div id="layer_list">
        {layer_arr!.map((l, i) => {
            const div_ref = useRef<HTMLDivElement>(null)
            useEffect(() => {
                const preview_div = div_ref.current;
                if (!preview_div) return;
                while (preview_div.hasChildNodes()) preview_div.removeChild(preview_div.firstChild!);
                l.preview.classList.add("layer_thumbnail_preview");
                preview_div.appendChild(l.preview);
            }, [div_ref.current]);
            useEffect(() => {
                const preview_div = div_ref.current;
                if (!preview_div) return;
                if (i ===  current_layer!) preview_div.classList.add("layer_thumbnail_selected");
                if (i !==  current_layer!) preview_div.classList.remove("layer_thumbnail_selected");
            }, [layer_arr![current_layer!], div_ref.current])
            return (
                <div key={i} ref={div_ref} className="layer_thumbnail" onClick={() => { set_current_layer(i) }}>
                </div>
            )
        })}
    </div>
    )
}
