import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RecoilRoot } from "recoil";
import { Window } from "./render/window";
import { StateWrappers } from "./state_wrappers";

const root = createRoot(document.querySelector("div#root")!);

root.render(
    <StrictMode>
        <RecoilRoot>
            <StateWrappers />
            <Window />
        </RecoilRoot>
    </StrictMode>
)