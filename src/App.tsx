import { useState } from "preact/hooks";
import "./App.css";
import { LayerList } from "./layer_list";
import { WorkSpace } from "./workspace";
import { binary_to_bitmap, layerT, load_file } from "./data";
import { TitleBar } from "./title_bar";
import { appWindow } from "@tauri-apps/api/window";
import { useEffect } from "preact/hooks";
import settings from "./setting.json"
import { Result } from "./utils";
import { ProjectLoading } from "./project_loading";

const App = () => {
    const [is_loading, set_loading] = useState(true);
    const [layer_arr, set_layer_arr] = useState<layerT[] | undefined>(undefined);
    const [current_layer, set_current_layer] = useState<number>(0);
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
                canvas.width = data.meta_data.width;
                canvas.height = data.meta_data.height;
                const ctx = canvas.getContext("2d")!;
                ctx.drawImage(bitmap, 0, 0);
                const preview = create_preview(canvas);
                layers.push({
                    body: canvas,
                    ctx: ctx,
                    preview: preview
                })
            }
            set_layer_arr(layers)
            set_loading(false);
        })()
    }, [])

    const [window_size, set_window_size] = useState<{ w: number, h: number }>({ w: window.innerWidth, h: window.innerHeight });
    const [is_maximized, set_maximized] = useState<boolean>(false);

    useEffect(() => { (async () => set_maximized(await appWindow.isMaximized()))() }, [])
    appWindow.onResized(async (_) => {
        set_window_size({ w: window.innerWidth, h: window.innerHeight });
        set_maximized(await appWindow.isMaximized());
    })

    return (
        <div id="app">
            <TitleBar is_maximized={is_maximized} is_loading={is_loading} />
            {!is_loading ? (<div id="main">
                <LayerList current_layer={current_layer} layer_arr={layer_arr!} set_current_layer={set_current_layer} />
                <WorkSpace current_layer={current_layer} layer_arr={layer_arr!} set_layer_arr={set_layer_arr} window_size={window_size} />
            </div>) : <ProjectLoading />}
        </div>
    );
}

export default App;

export type window_sizeT = { w: number, h: number };
