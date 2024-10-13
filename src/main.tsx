import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";

import { RecoilRoot, useSetRecoilState } from "recoil";
import { Window } from "./window";

import "./file"
import { StateWrappers } from "./state_wrappers";
import { opening_file_path_state } from "./app";
import { Option, StateBySetter } from "./common/utils";
import { invoke } from "@tauri-apps/api/core";

const root = createRoot(document.getElementById("root") as Element);

const WindowWrapper = ({ path }: { path: string | null }) => {
    const path_state = new StateBySetter(useSetRecoilState(opening_file_path_state));
    if (typeof path === "string") {
        console.log(path);
        path_state.set(Option.Some(path));
    }
    return (<Window />)
}

invoke<string | null>("initial_file_path").then(initial_path => {
    root.render(
        // <StrictMode>
        <RecoilRoot>
            <StateWrappers />
            <WindowWrapper path={initial_path} />
        </RecoilRoot>
        // </StrictMode>
    );
});