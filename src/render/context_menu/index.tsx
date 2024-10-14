import { ReactNode, RefObject, useEffect, useRef } from "react";
import "./index.css"
import { atom, useRecoilState, useRecoilValue } from "recoil";

export const is_context_menu_open_atom = atom({
    key: "is_context_menu_open",
    default: false,
})

export const context_menu_contents_atom = atom<string | ReactNode[]>({
    key: "context_menu_contents",
    default: ""
})

export const context_menu_position_atom = atom({
    key: "context_menu_position",
    default: { x: 0, y: 0 },
})

export const context_menu_ref_atom = atom<RefObject<HTMLDivElement> | null>({
    key: "context_menu_ref",
    default: null,
});

export const ContextMenu = () => {
    const [is_open, set_open] = useRecoilState(is_context_menu_open_atom);
    const position = useRecoilValue(context_menu_position_atom);
    const contents = useRecoilValue(context_menu_contents_atom);

    const [ref, set_ref] = useRecoilState(context_menu_ref_atom);
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