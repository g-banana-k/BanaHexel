import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { RecoilRoot } from "recoil";
import { Window } from "./window";

import "./file"

const root = createRoot(document.getElementById("root") as Element);

root.render(
    <div style={{
        width:"100%",
        height: "100%",
        backgroundColor: "#fff"
    }}></div>
)

root.render(
    // <StrictMode>
        <RecoilRoot>
            <Window />
        </RecoilRoot>
    // </StrictMode>
);