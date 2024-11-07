import { useEffect, useRef } from "react";
import { FPSMonitor } from "../../logic/performance/fps"

export const PerformanceMonitor = () => {
    const fps_m = new FPSMonitor({ width: 200, height: 50 });
    const d_ref = useRef<HTMLDivElement>(null);
    useEffect(()=>{
        const cb = () => {
            fps_m.frame();
            fps_m.draw();
            requestAnimationFrame(cb);
        }
        cb();
    },[])
    useEffect(() => {
        d_ref.current?.appendChild(fps_m.body.body);
    }, [])
    return (
        <div ref={d_ref} style={{zIndex: 100}}/>
    )
}