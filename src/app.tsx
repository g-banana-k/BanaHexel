import { useEffect } from "react";
import { DataFileT, read_file_from_path, UserDataT } from "./logic/command";
import { Option, Result, SetterOrUpdater, State, StateBySetter, UnRequired } from "./logic/utils";
import { binary_to_bitmap, Layer } from "./logic/data";
import { file_save_state_atom, meta_data_atom } from "./window";
import { LayerArea } from "./render/layer_area";
import { WorkSpace } from "./render/workspace";
import { ProjectLoading } from "./render/project_loading";
import { atom, useAtom, useSetAtom } from "jotai";
import { MetaDataT } from "./logic/file";

export const user_data_atom = atom(Option.None<UserDataT>())

export const layer_arr_atom = atom<Layer[] | undefined>(undefined)

export const current_layer_atom = atom(0)

export const canvas_size_atom = atom<{ width: number, height: number } | undefined>(undefined)

export const is_loading_atom = atom<boolean>(true)

export const load_file = async (data: UnRequired<DataFileT, "layers">, setters: {
    set_layer_arr: SetterOrUpdater<Layer[] | undefined>,
    set_canvas_size: SetterOrUpdater<{ width: number, height: number } | undefined>,
    set_loading: SetterOrUpdater<boolean>,
    set_current_layer: SetterOrUpdater<number>,
    set_meta_data: SetterOrUpdater<Option<MetaDataT>>
}) => {
    const promises: Promise<Result<ImageBitmap, unknown>>[] = [];
    if (data.layers !== undefined) data.layers.forEach((a) => { promises.push(binary_to_bitmap(a)) })
    await Promise.all(promises);
    const layers: Layer[] = [];

    if (data.layers === undefined) {
        layers.push(new Layer(undefined, data.meta_data.canvas_size))
    } else for (let i = 0; i < data.layers.length; i++) {
        const bitmap = (await promises[i]).unwrap();
        layers.push(new Layer(bitmap, data.meta_data.canvas_size))
        bitmap.close();
    }
    setters.set_meta_data(Option.Some(data.meta_data));
    setters.set_layer_arr(layers);
    setters.set_canvas_size(data.meta_data.canvas_size);
    setters.set_loading(false);
    setters.set_current_layer(_ => Math.min(_, layers.length - 1))
}

export const App = () => {
    const [is_loading, set_loading] = useAtom(is_loading_atom);
    const set_current_layer = useSetAtom(current_layer_atom);
    const set_layer_arr = useSetAtom(layer_arr_atom);
    const set_canvas_size = useSetAtom(canvas_size_atom);
    const set_meta_data = useSetAtom(meta_data_atom);
    const file_state = new State(useAtom(file_save_state_atom));
    useEffect(() => {
        (async () => {
            set_loading(true);
            if (file_state.val_global().path.is_some()) {
                const res = (await read_file_from_path(file_state.val_global().path.unwrap())).unwrap();
                await load_file(
                    res
                    , { set_canvas_size, set_layer_arr, set_loading, set_current_layer, set_meta_data });
                file_state.set({ saving: false, saved: false, path: Option.None() })
            } else {
                await load_file({
                    meta_data: {
                        canvas_size: {
                            width: 64,
                            height: 64,
                        },
                    },
                }, { set_canvas_size, set_layer_arr, set_loading, set_current_layer, set_meta_data });
                file_state.set({ saving: false, saved: false, path: Option.None() })
            }
        })()
    }, [])

    return (
        !is_loading ? (
            <div id="app">
                <LayerArea />
                <WorkSpace />
            </div>
        ) : (<ProjectLoading />)
    );
}

export default App;
