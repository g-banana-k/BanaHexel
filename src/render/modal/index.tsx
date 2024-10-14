import { atom, useAtom, useAtomValue } from "jotai";
import "./index.css";
import { X } from "lucide-react";
import { ReactNode } from "react";
import { useSetAtom } from "jotai";
import { SetterOrUpdater } from "../../logic/utils";

export const is_modal_open_atom = atom(
    false)

export const modal_contents_atom = atom<string | ReactNode[]>("")

export const modal_size_atom = atom<{ w: number, h: number }>({ w: 0, h: 0 })

export const useSetModal = (): [
    SetterOrUpdater<string | ReactNode[]>,
    SetterOrUpdater<{ w: number, h: number, }>,
    SetterOrUpdater<boolean>,
] => {
    const set_contents = useSetAtom(modal_contents_atom);
    const set_open = useSetAtom(is_modal_open_atom);
    const set_size = useSetAtom(modal_size_atom);
    return [
        set_contents,
        set_size,
        set_open
    ]
}

export const Modal = () => {
    const [is_modal_open, set_modal_open] = useAtom(is_modal_open_atom);
    const modal_contents = useAtomValue(modal_contents_atom);
    const modal_size = useAtomValue(modal_size_atom);

    return (
        <div id="modal_root" style={{ display: !is_modal_open ? "none" : "block" }}>
            <div id="modal_container" style={{ width: modal_size.w, height: modal_size.h }}>
                {typeof modal_contents === "string" ? modal_contents : modal_contents}
                <div id="modal_close_button" onClick={() => {
                    const e = new CustomEvent("modal_close", { detail: "default" });
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