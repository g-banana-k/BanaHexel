import { MutableRefObject, ReactNode, RefObject, useEffect, useRef } from "react";
import "./index.css"
import { atom, useRecoilState, useRecoilValue } from "recoil";

export const is_context_menu_open_state = atom({
    key: "is_context_menu_open_state",
    default: false,
})

export const context_menu_contents_state = atom<string | ReactNode[]>({
    key: "context_menu_contents_state",
    default: ""
})

export const context_menu_position_state = atom({
    key: "context_menu_position_state",
    default: { x: 0, y: 0 },
})

export const context_menu_ref_state = atom<RefObject<HTMLDivElement> | null>({
    key: "context_menu_ref_state",
    default: null,
});

export const ContextMenu = () => {
    const [is_open, set_open] = useRecoilState(is_context_menu_open_state);
    const position = useRecoilValue(context_menu_position_state);
    const contents = useRecoilValue(context_menu_contents_state);

    const [ref, set_ref] = useRecoilState(context_menu_ref_state);
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