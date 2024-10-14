import { SetterOrUpdater } from "recoil";
import { read_file, write_file_new, write_file_with_path } from "./command";
import { Layer } from "./data"
import { Option, State, StateBySetter } from "./utils"
import { UndoStack } from "./canvas_area/undo";
import { load_file } from "../app";

export type FileStateT = {
    saving: boolean,
    saved: boolean,
    path: Option<string>,
}

export type MetaDataT = {
    canvas_size: {
        width: number,
        height: number,
    }
}

export const save_file_with_path = ({ file_state, layer_arr, meta_data }: {
    file_state: StateBySetter<FileStateT>,
    layer_arr: Layer[],
    meta_data: MetaDataT
}) => {
    file_state.set(_ => ({ ..._, saving: true }));
    const f_s = file_state.val_local().unwrap();
    f_s.path.on_some(path => {
        write_file_with_path(path, { layers: layer_arr.map((l) => l.body), meta_data })
    })
    file_state.set(_ => ({ ..._, saving: false }));
}

export const save_file_new = async ({ file_state, layer_arr, meta_data }: {
    file_state: StateBySetter<FileStateT>,
    layer_arr: Layer[],
    meta_data: MetaDataT
}) => {
    file_state.set(_ => ({ ..._, saving: true }));
    const f_s = file_state.val_local().unwrap();
    const res = (await write_file_new({ layers: layer_arr.map((l) => l.body), meta_data }))
    res.on_ok(p => p.on_some(p => {
        file_state.set(_ => ({ ..._, saving: false, path: Option.Some(p) }));
    }).on_none(() => {

        file_state.set(_ => ({ ..._, saving: false, }));
    }))
}

export const open_file = async ({
    undo_stack,
    set_loading,
    set_layer_arr,
    set_canvas_size,
    set_current_layer,
    file_state,
}: {
    undo_stack: UndoStack,
    set_layer_arr: SetterOrUpdater<Layer[] | undefined>,
    set_canvas_size: SetterOrUpdater<{ width: number, height: number } | undefined>,
    set_loading: SetterOrUpdater<boolean>,
    set_current_layer: SetterOrUpdater<number>,
    file_state: State<FileStateT>,
}) => {
    if (file_state.val_global().saving) return;
    const new_data = (await read_file()).unwrap();
    new_data.on_some(async v => {
        undo_stack?.clear();
        set_loading(true);
        file_state.set(_=>({..._, path: Option.Some(v[0])}))
        await load_file(v[1], { set_loading, set_layer_arr, set_canvas_size, set_current_layer });
        set_loading(false);
        file_state.set(_=>({..._,saving:false,  saved: true}))
    })
}