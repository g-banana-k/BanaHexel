import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";

import { RecoilRoot, useSetRecoilState } from "recoil";
import { Window } from "./window";

import "./file"
import { StateWrappers } from "./state_wrappers";
import { opening_file_path_state } from "./app";
import { Option, println } from "./common/utils";
import { invoke } from "@tauri-apps/api/core";

const root = createRoot(document.getElementById("root") as Element);

const WindowWrapper = ({ path }: { path: string | null }) => {
    const path_set = useSetRecoilState(opening_file_path_state);
    useEffect(() => {
        if (typeof path === "string") {
            console.log(path);
            path_set(Option.Some(path));
        }
    }, [])
    return (<Window />)
}

const initial_path = await invoke<string | null>("initial_file_path");

root.render(
    // <StrictMode>
    <RecoilRoot>
        <StateWrappers />
        <WindowWrapper path={initial_path} />
    </RecoilRoot>
    // </StrictMode>
);

