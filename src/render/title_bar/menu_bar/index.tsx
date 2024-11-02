import { Dispatch, ReactNode, SetStateAction, useEffect, useRef } from "react";
import { atom, useSetAtom } from "jotai";

import { HelpMenuButton } from "./help";
import { FileMenuButton } from "./file";

export const MenuBar = () => {
    const menu_bar_ref = useRef<HTMLDivElement>(null);
    let set_selected = useSetAtom(menu_bar_selected_atom);

    useEffect(() => {
        const on_mousedown = (e: MouseEvent) => {
            if (!menu_bar_ref.current) return;
            const f = menu_bar_ref.current.contains(e.target as unknown as Node);
            if (f) return;
            set_selected(-1)
        };
        document.addEventListener("mousedown", on_mousedown);
        return () => {
            document.removeEventListener("mousedown", on_mousedown);
        }
    });

    return (
        <div ref={menu_bar_ref} id="title_bar_menu_bar">
            <FileMenuButton />
            <HelpMenuButton />
        </div >
    )
}

export const MenuButton = (props: { label: string, id: string, nth: number, selected: number, set_selected: Dispatch<SetStateAction<number>>, children: ReactNode }) => {
    const label_ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const label = label_ref.current
        if (!label) return;
        label.onmousedown = () => props.set_selected(selected => selected === props.nth ? -1 : props.nth);
        label.onmouseover = () => props.set_selected(selected => selected === -1 ? -1 : props.nth);
    }, [label_ref])
    return (
        <div className="title_bar_menu_button" id={props.id} >
            <div className={`title_bar_menu_button_label ${props.nth === props.selected ? "title_bar_menu_button_label_opened" : ""}`} ref={label_ref}>{props.label}</div>
            <div className={`title_bar_menu_contents ${props.nth === props.selected ? "title_bar_menu_contents_opened" : ""}`}>{props.children}</div>
        </div>
    )
}

export const MenuContent = (props: { children: ReactNode, on_click?: () => void }) => {
    return (
        <div className="title_bar_menu_content" onClick={props.on_click}>{props.children}</div>
    )
}

export const menu_bar_selected_atom = atom(-1)