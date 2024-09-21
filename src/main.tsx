import { createRoot } from "react-dom/client";

import { App } from "./App";
import { RecoilRoot } from "recoil";

const root = createRoot(document.getElementById("root") as Element);

root.render(
    <RecoilRoot>
        <App />
    </RecoilRoot>
);
