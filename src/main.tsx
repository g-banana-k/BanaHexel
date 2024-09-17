import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import { RecoilRoot } from "recoil";

const root = createRoot(document.getElementById("root") as Element);

root.render(
    <StrictMode>
        <RecoilRoot>
            <App />
        </RecoilRoot>
    </StrictMode>
);
