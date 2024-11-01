import { useSetAtom } from "jotai";
import { DataFileT } from "./command";
import { binary_to_bitmap, Layer } from "./data";
import { MetaDataT } from "./file";
import { Option, Result, SetterOrUpdater, UnRequired } from "./utils";
import { canvas_size_atom, current_layer_atom, is_loading_atom, layer_arr_atom } from "../app";
import { meta_data_atom } from "../window";

export type DataSettersT = {
    set_canvas_size: SetterOrUpdater<{ width: number, height: number } | undefined>,
    set_loading: SetterOrUpdater<boolean>,
    set_current_layer: SetterOrUpdater<number>,
    set_meta_data: SetterOrUpdater<Option<MetaDataT>>
    set_layer_arr: SetterOrUpdater<Layer[] | undefined>,
}

export const useDataSetters = (): DataSettersT => {
    const set_canvas_size = useSetAtom(canvas_size_atom);
    const set_loading = useSetAtom(is_loading_atom);
    const set_current_layer = useSetAtom(current_layer_atom);
    const set_meta_data = useSetAtom(meta_data_atom);
    const set_layer_arr = useSetAtom(layer_arr_atom);
    return {
        set_canvas_size,
        set_loading,
        set_current_layer,
        set_meta_data,
        set_layer_arr,
    }
}

export const load_file = async (data: UnRequired<DataFileT, "layers">, setters: DataSettersT) => {
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