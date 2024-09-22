import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { RecoilRoot } from "recoil";
import { Window } from "./window";

const root = createRoot(document.getElementById("root") as Element);

root.render(
    // <StrictMode>
        <RecoilRoot>
            <Window />
        </RecoilRoot>
    // </StrictMode>
);
