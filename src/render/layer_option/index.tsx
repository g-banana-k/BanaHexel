import { atom, useRecoilState } from "recoil"
import "./index.css"
import { Layers3 } from "lucide-react"
import { State } from "../../logic/utils"

export const layers_display_opacity_atom = atom({
    key: "layers_display_opacity",
    default: {back: 50, front: 50}
})

export const LayerOption = () => {
    const opacity = new State(useRecoilState(layers_display_opacity_atom));
    return (
        <div id="layer_display_option">
            <div id="layer_display_option_area_icon">
                <Layers3 size={20} />
            </div>
            <div id="layer_display_option_front">
                上
                <input value={opacity.val_local().front} onInput={e => {
                    const v = Math.min(100, Math.max(0, parseInt(e.currentTarget.value) || 0));
                    e.currentTarget.value = `${v}`;
                    opacity.set({...opacity.val_local(), front: v});
                }}/>%
            </div>
            <div id="layer_display_option_back">
                下
                <input value={opacity.val_local().back} onInput={e => {
                    const v = Math.min(100, Math.max(0, parseInt(e.currentTarget.value) || 0));
                    e.currentTarget.value = `${v}`;
                    opacity.set({...opacity.val_local(), back: v});
                }}/>%
            </div>
        </div>
    )
}