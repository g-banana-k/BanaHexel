import { useEffect } from "react";
import { DataFileT, read_file_from_path, UserDataT } from "./logic/command";
import { Option, Result, SetterOrUpdater, State, StateBySetter, UnRequired } from "./logic/utils";
import { binary_to_bitmap, Layer } from "./logic/data";
import { file_save_state_atom, meta_data_atom } from "./window";
import { LayerArea } from "./render/layer_area";
import { WorkSpace } from "./render/workspace";
import { ProjectLoading } from "./render/project_loading";
import { atom, useAtom, useSetAtom } from "jotai";
import { load_file, useDataSetters } from "./logic/app";

export const user_data_atom = atom(Option.None<UserDataT>())

export const layer_arr_atom = atom<Layer[] | undefined>(undefined)

export const current_layer_atom = atom(0)

export const canvas_size_atom = atom<{ width: number, height: number } | undefined>(undefined)

export const is_loading_atom = atom<boolean>(true)

export const App = () => {
    const [is_loading, set_loading] = useAtom(is_loading_atom);
    const setters = useDataSetters();
    const file_state = new State(useAtom(file_save_state_atom));
    useEffect(() => {
        (async () => {
            set_loading(true);
            if (file_state.val_global().path.is_some()) {
                const res = (await read_file_from_path(file_state.val_global().path.unwrap())).unwrap();
                await load_file(res, setters);
                file_state.set({ saving: false, saved: false, path: Option.None() })
            } else {
                await load_file({
                    meta_data: {
                        canvas_size: {
                            width: 64,
                            height: 64,
                        },
                    },
                }, setters);
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
