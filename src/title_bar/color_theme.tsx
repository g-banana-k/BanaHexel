import "../color_theme/index.css"

import { useState } from "react"
import { State } from "../common/utils";
import { Moon, Sun } from "lucide-react";
import { useRecoilState, useRecoilValue } from "recoil";
import { color_theme_state, ColorTheme } from "../color_theme";

export const ThemeToggleSwitch = () => {
    useRecoilValue(color_theme_state);
    return (<div id="app_theme_toggle_switch_container">
        <div id="app_theme_toggle_switch" className="" onClick={e => {
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