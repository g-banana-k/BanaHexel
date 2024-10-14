import { ReactNode, RefObject, useEffect, useRef } from "react";
import "./index.css"
import { atom, useAtom, useAtomValue } from "jotai";

export const is_context_menu_open_atom = atom(false)

export const context_menu_contents_atom = atom<string | ReactNode[]>( "")

export const context_menu_position_atom = atom({ x: 0, y: 0 },)

export const context_menu_ref_atom = atom<RefObject<HTMLDivElement> | null>(null);

export const ContextMenu = () => {
    const [is_open, set_open] = useAtom(is_context_menu_open_atom);
    const position = useAtomValue(context_menu_position_atom);
    const contents = useAtomValue(context_menu_contents_atom);

    const [ref, set_ref] = useAtom(context_menu_ref_atom);
    const ref_raw = useRef<HTMLDivElement>(null);

    useEffect(() => {
        set_ref(ref_raw);
    });

    useEffect(() => {
        const div = ref?.current;
        if (!div) return;
        document.addEventListener("mousedown", e => {
            if (!div.contains(e.target as Node)) set_open(false);
        })
        div.addEventListener("click", e => {
            if (e.target !== e.currentTarget) set_open(false);
        })
    }, [ref])

    return (<div ref={ref_raw} id="context_menu" style={{
        left: position.x,
        top: position.y,
        display: is_open ? "block" : "none"
    }}>
        {typeof contents == "string" ? contents : contents}
    </div>)
}