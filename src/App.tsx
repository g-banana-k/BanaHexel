import { useEffect } from "react";
import "./App.css";
import { LayerList } from "./layer_list";
import { WorkSpace } from "./workspace";
import { binary_to_bitmap, data_fileT, Layer, open_file_from_path } from "./data";
import { TitleBar } from "./title_bar";
import { appWindow } from "@tauri-apps/api/window";
import settings from "./setting.json"
import { Result, UnRequired } from "./utils";
import { ProjectLoading } from "./project_loading";
import { atom, useRecoilState, useSetRecoilState } from "recoil";

export const window_size_state = atom({
    key: "window_size_state",
    default: { w: window.innerWidth, h: window.innerHeight },
})

export const is_window_maximized_state = atom({
    key: "is_window_maximized_state",
    default: false,
})

export const layer_arr_state = atom<Layer[] | undefined>({
    key: "layer_arr_state",
    default: undefined
})

export const current_layer_state = atom({
    key: "current_layer_state",
    default: 0
})

export const canvas_size_state = atom<{ width: number, height: number } | undefined>({
    key: "canvas_size_state",
    default: undefined
})

export const is_loading_state = atom<boolean>({
    key: "is_loading_state",
    default: true,
})

export const opening_file_state_path = atom<string | undefined>({
    key: "opening_file_state_path",
    default: undefined,
})

export const load_file = async (data: UnRequired<data_fileT, "layers">, setters: {
    set_layer_arr: (arg0: Layer[]) => void,
    set_canvas_size: (arg0: { width: number, height: number }) => void,
    set_loading: (arg0: boolean) => void,
}) => {
    const promises: Promise<Result<CanvasImageSource, unknown>>[] = [];
    if (data.layers !== undefined) data.layers.forEach((a) => promises.push(binary_to_bitmap(a)))
    await Promise.all(promises);
    const layers: Layer[] = [];

    if (data.layers === undefined) {
        layers.push(new Layer(undefined, data.meta_data.canvas_size))
    } else for (let i = 0; i < data.layers.length; i++) {
        const bitmap = (await promises[i]).unwrap();
        layers.push(new Layer(bitmap, data.meta_data.canvas_size))
    }
    setters.set_layer_arr(layers);
    setters.set_canvas_size(data.meta_data.canvas_size);
    setters.set_loading(false);
}


export const App = () => {
    const [is_loading, set_loading] = useRecoilState(is_loading_state);
    const set_layer_arr = useSetRecoilState(layer_arr_state);
    const set_canvas_size = useSetRecoilState(canvas_size_state);
    const set_opening_file_path = useSetRecoilState(opening_file_state_path);
    useEffect(() => {
        (async () => {
            const data = (await open_file_from_path(settings.default_project)).unwrap();
            set_opening_file_path(settings.default_project);
            set_loading(true);
            await load_file(data, { set_canvas_size, set_layer_arr, set_loading });
        })()
    }, [])

    const set_window_size = useSetRecoilState(window_size_state);
    const set_maximized = useSetRecoilState(is_window_maximized_state);

    useEffect(() => {
        (async () => set_maximized(await appWindow.isMaximized()))();
        appWindow.onResized(async (_) => {
            set_window_size({ w: window.innerWidth, h: window.innerHeight });
            set_maximized(await appWindow.isMaximized());
        })
    }, [])

    return (
        <div id="app">
            <TitleBar is_loading={is_loading} />
            {!is_loading ? (<div id="main">
                <LayerList />
                <WorkSpace />
            </div>) : <ProjectLoading />}
        </div>
    );
}

export default App;

export type window_sizeT = { w: number, h: number };
