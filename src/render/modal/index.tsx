import { atom, useRecoilState, useRecoilValue } from "recoil";
import "./index.css";
import { X } from "lucide-react";
import { ReactNode } from "react";

export const is_modal_open_atom = atom({
    key: "is_modal_open",
    default: false,
})

export const modal_contents_atom = atom<string | ReactNode[]>({
    key: "modal_contents",
    default: ""
})

export const modal_size_atom = atom<{ w: number, h: number }>({
    key: "modal_size",
    default: { w: 0, h: 0 }
})

export const Modal = () => {
    const [is_modal_open, set_modal_open] = useRecoilState(is_modal_open_atom);
    const modal_contents = useRecoilValue(modal_contents_atom);
    const modal_size = useRecoilValue(modal_size_atom);

    return (
        <div id="modal_root" style={{ display: !is_modal_open ? "none" : "block" }}>
            <div id="modal_container" style={{ width: modal_size.w, height: modal_size.h }}>
                {typeof modal_contents === "string" ? modal_contents : modal_contents}
                <div id="modal_close_button" onClick={() => {
                    const e = new CustomEvent("modal_close", {detail: "default"});
                    document.dispatchEvent(e)
                    set_modal_open(false);
                }}>
                    <X size={16} />
                </div>
            </div>
        </div>
    )
}

declare global {
    interface DocumentEventMap {
        "modal_close": CustomEvent<string>;
    }
}