import "../color_theme/index.css"

import { Moon, Sun } from "lucide-react";
import { useRecoilValue } from "recoil";
import { color_theme_state, ColorTheme } from "../color_theme";
import { useEffect, useRef } from "react";

export const ThemeToggleSwitch = () => {
    const e_ref = useRef<HTMLDivElement>(null);
    useRecoilValue(color_theme_state);
    useEffect(() => {
        const e = e_ref.current;
        if (!e) return;
        const f = ColorTheme.current_name().unwrap_or("_");
        if (f === "light") {
            const class_list = e.classList;
            const body_class_list = document.body.classList;
            class_list.add("right");
            body_class_list.add("light");
        }
    }, [])
    return (<div id="app_theme_toggle_switch_container">
        <div ref={e_ref} id="app_theme_toggle_switch" onClick={e => {
            const class_list = e.currentTarget.classList;
            const body_class_list = document.body.classList;
            const f = ColorTheme.current_name().unwrap_or("_") === "light" ? "dark" : "light";
            if (f === "light") {
                class_list.add("right");
                body_class_list.add("light");
            } else {
                class_list.remove("right");
                body_class_list.remove("light");
            }
            ColorTheme.apply(f);
        }}>
            <Sun size={16} id="app_theme_toggle_switch_sun" />
            <Moon size={16} id="app_theme_toggle_switch_moon" />
            <div id="app_theme_toggle_switch_button" />
        </div>
    </div>)
}