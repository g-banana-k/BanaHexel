import { ReactNode, useEffect, useRef } from "react";
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
export const ContextMenu = ({container_ref: ref}: {container_ref: React.RefObject<HTMLDivElement>}) => {
    const [is_open, set_open] = useRecoilState(is_context_menu_open_state);
    const position = useRecoilValue(context_menu_position_state);
    const contents = useRecoilValue(context_menu_contents_state);

    useEffect(() => {
        const div = ref.current;
        console.log(div);
        if (!div) return;
        document.addEventListener("mousedown", e => {
            if (!div.contains(e.target as Node)) set_open(false);
        })
    }, [])

    return (<div ref={ref} id="context_menu" style={{
        left: position.x,
        top: position.y,
        display: is_open ? "block" : "none"
    }}>
        {typeof contents == "string" ? contents : contents}
    </div>)
}