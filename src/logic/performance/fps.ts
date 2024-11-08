import { Canvas } from "../common/canvas"

export class FPSMonitor {
    body: Canvas;
    record: [number, number][];
    start: number;
    before: number;
    constructor({ width, height }: { width: number, height: number }) {
        this.body = new Canvas({ width, height });
        this.record = [];
        this.start = performance.now();
        this.before = performance.now();
    }
    frame() {
        const now = performance.now();
        this.record.push([now, 1000 / (now - this.before)]);
        this.before = now;
        if (this.record[0][0] < now - 10000) {
            const new_v: [number, number][] = [];
            this.record.forEach((e) => {
                if (now - 10000 <= e[0]) {
                    new_v.push(e)
                }
            })
            this.record = new_v;
        }
    }
    draw() {
        const now = performance.now();
        const canvas = this.body.body;
        const ctx = this.body.ctx;
        ctx.fillStyle = "#eee";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const get_pos = ([t, f]: [number, number]) => {
            const t_r = (1 - (now - t) / 10000);
            return { x: t_r * canvas.width, y: f / 70 * canvas.height };
        }
        ctx.strokeStyle = "#f00";
        ctx.beginPath();
        {
            const { x, y } = get_pos(this.record[0]);
            ctx.moveTo(x, canvas.height - y);
        }
        this.record.forEach((([t, f]) => {
            const { x, y } = get_pos([t, f]);
            ctx.lineTo(x, canvas.height - y);
        }));
        ctx.stroke();
        ctx.closePath();

        ctx.strokeStyle = "#aaa";
        ctx.setLineDash([5, 5]);
        ctx.beginPath()
        ctx.moveTo(0, 1 / 7 * canvas.height);
        ctx.lineTo(canvas.width, 1 / 7 * canvas.height);
        ctx.stroke();
        ctx.closePath();
        ctx.setLineDash([]);
    }
}