import { useEffect } from "react";
import { atom, SetterOrUpdater, useRecoilState, useSetRecoilState } from "recoil";
import { DataFileT, read_file_from_path, UserDataT } from "./logic/command";
import { Option, Result, State, StateBySetter, UnRequired } from "./logic/utils";
import { binary_to_bitmap, Layer } from "./logic/data";
import { file_save_state_atom } from "./window";
import { LayerArea } from "./render/layer_area";
import { WorkSpace } from "./render/workspace";
import { ProjectLoading } from "./render/project_loading";

export const user_data_atom = atom({
    key: "user_data",
    default: Option.None<UserDataT>(),
})

export const layer_arr_atom = atom<Layer[] | undefined>({
    key: "layer_arr",
    default: undefined
})

export const current_layer_atom = atom({
    key: "current_layer",
    default: 0
})

export const canvas_size_atom = atom<{ width: number, height: number } | undefined>({
    key: "canvas_size",
    default: undefined
})

export const is_loading_atom = atom<boolean>({
    key: "is_loading",
    default: true,
})

export const opening_file_path_atom = atom<Option<string>>({
    key: "opening_file_path",
    default: Option.None(),
})

export const load_file = async (data: UnRequired<DataFileT, "layers">, setters: {
    set_layer_arr: SetterOrUpdater<Layer[] | undefined>,
    set_canvas_size: SetterOrUpdater<{ width: number, height: number } | undefined>,
    set_loading: SetterOrUpdater<boolean>,
    set_current_layer: SetterOrUpdater<number>,
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
    setters.set_layer_arr(layers);
    setters.set_canvas_size(data.meta_data.canvas_size);
    setters.set_loading(false);
    setters.set_current_layer(_ => Math.min(_, layers.length - 1))
}

export const App = () => {
    const [is_loading, set_loading] = useRecoilState(is_loading_atom);
    const set_current_layer = useSetRecoilState(current_layer_atom);
    const set_layer_arr = useSetRecoilState(layer_arr_atom);
    const set_canvas_size = useSetRecoilState(canvas_size_atom);
    const opening_file_path = new StateBySetter(useSetRecoilState(opening_file_path_atom));
    const file_state = new State(useRecoilState(file_save_state_atom));
    useEffect(() => {
        (async () => {
            set_loading(true);
            console.log(opening_file_path.val_global())
            if (opening_file_path.val_global().is_some()) {
                const res = (await read_file_from_path(opening_file_path.val_local().unwrap().unwrap())).unwrap();
                await load_file(
                    res
                    , { set_canvas_size, set_layer_arr, set_loading, set_current_layer });
                file_state.set({ saving: false, saved: false, path: Option.None() })
            } else {
                opening_file_path.set(Option.None());
                await load_file({
                    meta_data: {
                        canvas_size: {
                            width: 64,
                            height: 64,
                        },
                    },
                }, { set_canvas_size, set_layer_arr, set_loading, set_current_layer });
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
