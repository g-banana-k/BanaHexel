import { atom, useRecoilState, useRecoilValue } from "recoil";
import "./index.css";
import { X } from "lucide-react";
import { ReactNode } from "react";

export const is_modal_open_state = atom({
    key: "is_modal_open_state",
    default: false,
})

export const modal_contents_state = atom<string | ReactNode[]>({
    key: "modal_contents_state",
    default: ""
})

export const modal_size_state = atom<{ w: number, h: number }>({
    key: "modal_size_state",
    default: { w: 0, h: 0 }
})

export const Modal = () => {
    const [is_modal_open, set_modal_open] = useRecoilState(is_modal_open_state);
    const modal_contents = useRecoilValue(modal_contents_state);
    const modal_size = useRecoilValue(modal_size_state);

    return (
        <div id="modal_root" style={{ display: !is_modal_open ? "none" : "block" }}>
            <div id="modal_container" style={{ width: modal_size.w, height: modal_size.h }}>
                {typeof modal_contents === "string" ? modal_contents : modal_contents}
                <div id="modal_close_button" onClick={() => set_modal_open(false)}>
                    <X size={16} />
                </div>
            </div>
        </div>
    )
}