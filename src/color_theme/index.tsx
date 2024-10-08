import { atom, selector, SetterOrUpdater, useSetRecoilState } from "recoil";
import { Option } from "../common/utils";

export const color_theme_state = atom<Option<ColorTheme>>({
    key: "color_theme_state_atom",
    default: Option.None()
})

export class ColorTheme {
    name: string;
    val: ColorThemeRecord;
    constructor(name: string, val: ColorThemeRecord) {
        this.name = name;
        this.val = val;
    }
    static themes = new Map<string, ColorTheme>();
    static current = Option.None<ColorTheme>();
    static atom_setter = Option.None<SetterOrUpdater<Option<ColorTheme>>>();
    static register(t: ColorTheme) {
        this.themes.set(t.name, t);
    }
    static apply(name: string): void;
    static apply(arg: ColorTheme): void;
    static apply(arg: string | ColorTheme) {
        if (typeof arg === "string") {
            this.current = Option.Some(this.themes.get(arg)!)
        } else {
            this.register(arg);
            this.current = Option.Some(arg);
        }
        this.atom_setter.unwrap_or(() => { })(this.current);
        const theme = this.current.unwrap();
        property_keys.forEach(key => {
            const v = theme.val[key];
            document.body.style.setProperty(`--${key}`, v);
        })
    }
    static current_name(): Option<string> {
        return this.current.on_some(_ => _.name)
    }
}

const property_keys = [
    "background_color",
    "char_color",
    "accent_color",
    "title_bar",
    "menu_bar",
    "menu_bar_hover",
    "menu_bar_drop_down",
    "menu_bar_drop_down_hover",
    "window_control_hover",
    "layer_area",
    "layer_outline",
    "layer_outline_hover",
    "layer_outline_selected",
    "layer_delete_button",
    "layer_delete_button_hover",
    "layer_add_button",
    "layer_add_button_hover",
    "color_picker_back",
    "color_picker_mode",
    "color_palette_add_button",
    "work_space_background",
    "work_space_separator",
    "tool_icon_hover",
    "tool_icon_selected",
    "text_box",
    "text_box_focus",
    "slider_knob",
    "slider_knob_hover",
    "slider_default",
    "zoom_button",
    "zoom_button_hover",
    "zoom_button_active",
    "modal_background",
    "modal_close_button_hover",
    "scroll_bar",
    "canvas_area_distant_view",
    "canvas_background_1",
    "canvas_background_2",
    "canvas_scrollbar",
    "tool_menu_edit_button",
    "modal_confirm",
    "modal_confirm_hover",
] as const

type ColorThemeRecord = Record<typeof property_keys[number], string>

const dark = new ColorTheme("dark", {
    background_color: "#222",
    char_color: "#fff",
    accent_color: "#5fe075",
    title_bar: "#555",
    menu_bar: "#0000",
    menu_bar_hover: "#5d5d5d",
    menu_bar_drop_down: "#666",
    menu_bar_drop_down_hover: "#777",
    window_control_hover: "#666",
    layer_area: "#444",
    layer_outline: "#333",
    layer_outline_hover: "#5fe07588",
    layer_outline_selected: "#5fe075",
    layer_delete_button: "#555",
    layer_delete_button_hover: "#666",
    layer_add_button: "#555",
    layer_add_button_hover: "#666",
    color_picker_back: "#444",
    color_picker_mode: "#333",
    color_palette_add_button: "#fff2",
    work_space_background: "#222",
    work_space_separator: "#333",
    tool_icon_hover: "#5fe07544",
    tool_icon_selected: "#5fe07588",
    text_box: "#fff1",
    text_box_focus: "#fff2",
    slider_knob: "#fff3",
    slider_knob_hover: "#fff6",
    slider_default: "#444",
    zoom_button: "#0000",
    zoom_button_hover: "#5fe07511",
    zoom_button_active: "#5fe07522",
    modal_background: "#333",
    modal_close_button_hover: "#555",
    scroll_bar: "#555",
    canvas_area_distant_view: "#444",
    canvas_background_1: "#111",
    canvas_background_2: "#222",
    canvas_scrollbar: "#2226",
    tool_menu_edit_button: "#333",
    modal_confirm:  "#5fe075aa",
    modal_confirm_hover:  "#5fe075",
})

const light = new ColorTheme("light", {
    background_color: "#222",
    char_color: "#111",
    accent_color: "#5fe075",
    title_bar: "#eee",
    menu_bar: "#0000",
    menu_bar_hover: "#ddd",
    menu_bar_drop_down: "#fff",
    menu_bar_drop_down_hover: "#ccc",
    window_control_hover: "#ddd",
    layer_area: "#ddd",
    layer_outline: "#bbb",
    layer_outline_hover: "#5fe07566",
    layer_outline_selected: "#5fe075",
    layer_delete_button: "#bbb",
    layer_delete_button_hover: "#ccc",
    layer_add_button: "#eee",
    layer_add_button_hover: "#fff",
    color_picker_back: "#eee",
    color_picker_mode: "#ddd",
    color_palette_add_button: "#2222",
    work_space_background: "#fff",
    work_space_separator: "#ddd",
    tool_icon_hover: "#5fe07566",
    tool_icon_selected: "#5fe075bb",
    text_box: "#2221",
    text_box_focus: "#2222",
    slider_knob: "#2223",
    slider_knob_hover: "#2226",
    slider_default: "#ccc",
    zoom_button: "#0000",
    zoom_button_hover: "#5fe07511",
    zoom_button_active: "#5fe07522",
    modal_background: "#fff",
    modal_close_button_hover: "#ddd",
    scroll_bar: "#bbb",
    canvas_area_distant_view: "#ddd",
    canvas_background_1: "#fff",
    canvas_background_2: "#eee",
    canvas_scrollbar: "#2226",
    tool_menu_edit_button: "#eee",
    modal_confirm:  "#5fe075aa",
    modal_confirm_hover:  "#5fe075",
})

ColorTheme.apply(dark);
ColorTheme.register(light);

export const ColorThemeClassWrapper = () => {
    const set = useSetRecoilState(color_theme_state);
    set(ColorTheme.current);
    ColorTheme.atom_setter = Option.Some(set);
    return <div />
}