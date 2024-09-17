import { useEffect, useRef } from "preact/hooks"
import { layerT } from "../data"
import "./index.css"

export const LayerList = (props: { layer_arr: layerT[], current_layer: number, set_current_layer: (arg0: number) => void }) => {
    return (<div id="layer_list">
        {props.layer_arr.map((l, i) => {
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
                if (i === props.current_layer) preview_div.classList.add("layer_thumbnail_selected");
                if (i !== props.current_layer) preview_div.classList.remove("layer_thumbnail_selected");
            }, [props.layer_arr[props.current_layer], div_ref.current])
            return (
                <div ref={div_ref} class="layer_thumbnail" onClick={() => { props.set_current_layer(i) }}>
                </div>
            )
        })}
    </div>
    )
}
