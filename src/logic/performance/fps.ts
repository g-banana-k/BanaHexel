import { Canvas } from "../common/canvas"

export class FPSMonitor {
    body: Canvas;
    record: Map<number, number>;
    start: number;
    before: number;
    constructor({ width, height }: { width: number, height: number }) {
        this.body = new Canvas({ width, height });
        this.record = new Map();
        this.start = performance.now();
        this.before = performance.now();
    }
    frame() {
        const now = performance.now();
        this.record.set(now, 1 / ((now - this.before) / 1000));
        this.before = now;
    }
}