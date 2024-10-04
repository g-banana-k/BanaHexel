import "./color_theme.css"

import { useRef, useState } from "react"
import { State } from "../common/utils";
import { Moon, Sun } from "lucide-react";

export const ThemeToggleSwitch = () => {
    const right = new State(useState(false));
    return (<div id="app_theme_toggle_switch_container">
        <div id="app_theme_toggle_switch" className="" onClick={e => {
            const class_list = e.currentTarget.classList;
            const body_class_list = document.body.classList;
            const f = !right.val_local();
            if (f) {
                class_list.add("right");
                body_class_list.add("light");
            } else {
                class_list.remove("right");
                body_class_list.remove("light");
            }
            right.set(f);
        }}>
            <Sun size={16} id="app_theme_toggle_switch_sun" />
            <Moon size={16} id="app_theme_toggle_switch_moon" />
            <div id="app_theme_toggle_switch_button" />
        </div>
    </div>)
}