import { createRoot } from "react-dom/client";

import { file_save_state_atom, Window } from "./window";

import "./logic/file"
import { StateWrappers } from "./state_wrappers";
import { Option, StateBySetter } from "./logic/utils";
import { invoke } from "@tauri-apps/api/core";
import { useSetAtom } from "jotai";

const root = createRoot(document.getElementById("root") as Element);

const WindowWrapper = ({ path }: { path: string | null }) => {
    const path_state = new StateBySetter(useSetAtom(file_save_state_atom));
    if (typeof path === "string") {
        console.log(path);
        path_state.set(_ => ({ ..._, path: Option.Some(path) }));
    }
    return (<Window />)
}

invoke<string | null>("initial_file_path").then(initial_path => {
    root.render(
        <div>
            <StateWrappers />
            <WindowWrapper path={initial_path} />
        </div>
    );
});