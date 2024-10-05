import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { RecoilRoot } from "recoil";
import { Window } from "./window";

import "./file"
import { StateWrappers } from "./state_wrappers";

const root = createRoot(document.getElementById("root") as Element);

root.render(
    // <StrictMode>
        <RecoilRoot>
            <StateWrappers />
            <Window />
        </RecoilRoot>
    // </StrictMode>
);