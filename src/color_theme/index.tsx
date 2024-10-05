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
        console.log(theme);
        property_keys.forEach(key => {
            const v = theme.val[key];
            document.body.style.setProperty(`--${key}`, v);
        })
    }
    static current_name(): Option<string> {
        return this.current.on_some(_=>_.name)
    }
}

const property_keys = ["background_color", "char_color", "accent_color", "title_bar", "menu_bar", "menu_bar_hover", "menu_bar_drop_down", "menu_bar_drop_down_hover", "window_control_hover", "layer_area", "layer_outline", "layer_outline_hover", "layer_outline_selected", "layer_delete_button", "layer_delete_button_hover", "layer_add_button", "layer_add_button_hover", "color_picker_back", "color_picker_mode", "color_palette_add_button", "work_space_background", "tool_icon_hover", "tool_icon_selected", "text_box", "text_box_focus", "slider_knob", "slider_knob_hover", "zoom_button", "zoom_button_hover", "zoom_button_active",] as const

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
    tool_icon_hover: "#5fe07544",
    tool_icon_selected: "#5fe07588",
    text_box: "#fff1",
    text_box_focus: "#fff2",
    slider_knob: "#fff2",
    slider_knob_hover: "#fff4",
    zoom_button: "#0000",
    zoom_button_hover: "#5fe07511",
    zoom_button_active: "#5fe07522",
})

const light = new ColorTheme("light", {
    background_color: "#222",
    char_color: "#111",
    accent_color: "#5fe075",
    title_bar: "#fff",
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
    tool_icon_hover: "#5fe07544",
    tool_icon_selected: "#5fe07588",
    text_box: "#fff1",
    text_box_focus: "#fff2",
    slider_knob: "#fff2",
    slider_knob_hover: "#fff4",
    zoom_button: "#0000",
    zoom_button_hover: "#5fe07511",
    zoom_button_active: "#5fe07522",
})

ColorTheme.apply(dark);
ColorTheme.register(light);

export const ColorThemeClassWrapper = () => {
    const set = useSetRecoilState(color_theme_state);
    set(ColorTheme.current);
    ColorTheme.atom_setter = Option.Some(set);
    return <div />
}