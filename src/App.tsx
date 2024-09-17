import { useEffect, useState } from "react";
import "./App.css";
import { LayerList } from "./layer_list";
import { WorkSpace } from "./workspace";
import { binary_to_bitmap, layerT, load_file } from "./data";
import { TitleBar } from "./title_bar";
import { appWindow } from "@tauri-apps/api/window";
import settings from "./setting.json"
import { Result } from "./utils";
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

export const layer_arr_state = atom<layerT[] | undefined>({
    key: "layer_arr_state",
    default: undefined
})

export const current_layer_state = atom({
    key: "current_layer_state",
    default: 0
})

export const canvas_size_state = atom<{width: number, height: number} | undefined>({
    key: "canvas_size_state",
    default: undefined
})

export const App = () => {
    const [is_loading, set_loading] = useState(true);
    const set_layer_arr = useSetRecoilState(layer_arr_state);
    const set_canvas_size = useSetRecoilState(canvas_size_state);
    useEffect(() => {
        (async () => {
            const data = (await load_file(settings.default_project)).unwrap();
            const promises: Promise<Result<CanvasImageSource, unknown>>[] = [];
            data.layers.forEach((a) => promises.push(binary_to_bitmap(a)))
            await Promise.all(promises);
            const layers: layerT[] = [];
            for (let i = 0; i < data.layers.length; i++) {
                const create_preview = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
                    const preview = document.createElement("canvas");
                    preview.width = 100;
                    preview.height = 100;
                    const preview_ctx = preview.getContext("2d")!;
                    if (canvas.width < canvas.height) {
                        preview_ctx.drawImage(canvas, 50 * (1 - canvas.width / canvas.height), 0, 100 * canvas.width / canvas.height, 100);
                    } else {
                        preview_ctx.drawImage(canvas, 0, 50 * (1 - canvas.height / canvas.width), 100, 100 * canvas.height / canvas.width)
                    }
                    return preview
                }
                const bitmap = (await promises[i]).unwrap();
                const canvas = document.createElement("canvas");
                canvas.width = data.canvas_size.width;
                canvas.height = data.canvas_size.height;
                const ctx = canvas.getContext("2d")!;
                ctx.drawImage(bitmap, 0, 0);
                const preview = create_preview(canvas);
                layers.push({
                    body: canvas,
                    ctx: ctx,
                    preview: preview
                })
            }
            set_layer_arr(layers);
            set_canvas_size(data.canvas_size);
            set_loading(false);
        })()
    }, [])

    const set_window_size = useSetRecoilState(window_size_state);
    const set_maximized = useSetRecoilState(is_window_maximized_state);

    useEffect(() => {
        (async () => set_maximized(await appWindow.isMaximized()))();
        console.log("heya")
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
