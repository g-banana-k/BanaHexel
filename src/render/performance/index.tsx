import "./index.css"

import { useEffect, useRef, useState } from "react";
import { FPSMonitor } from "../../logic/performance/fps"
import { Gauge } from "lucide-react";

export const PerformanceMonitor = () => {
    const fps_m = new FPSMonitor({ width: 400, height: 150 });
    const d_ref = useRef<HTMLDivElement>(null);
    const [is_opening, set_opening] = useState(false);
    useEffect(() => {
        const cb = () => {
            fps_m.frame();
            fps_m.draw();
            requestAnimationFrame(cb);
        }
        cb();
    }, [])
    useEffect(() => {
        if (d_ref.current?.firstChild) d_ref.current?.removeChild(d_ref.current.firstChild!);
        d_ref.current?.appendChild(fps_m.body.body);
    }, [])
    return (
        <div id="performance_outer" className={is_opening ? "open" : ""}>
            <div id="performance_icon" onClick={() => set_opening(b => !b)}><Gauge size={20} /></div>
            <div id="performance_container" ref={d_ref}></div>
        </div>
    )
}