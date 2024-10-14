export class Canvas {
    body: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    constructor(c: HTMLCanvasElement | ImageBitmap, clone?: boolean)
    constructor(wh: { width: number, height: number })
    constructor(c: { width: number, height: number } | HTMLCanvasElement | ImageBitmap, clone?: boolean) {
        if (clone) {
            const n_c = document.createElement("canvas");
            n_c.width = c.width;
            n_c.height = c.height;
            const ctx = n_c.getContext("2d")!;
            ctx.drawImage(c as CanvasImageSource, 0, 0);
            this.body = n_c;
            this.ctx = ctx;
        } else {
            const n_c = document.createElement("canvas");
            n_c.width = c.width;
            n_c.height = c.height;
            const ctx = n_c.getContext("2d")!;
            this.body = n_c;
            this.ctx = ctx;
        }
    }
    ctx_safe(proc: (ctx: CanvasRenderingContext2D) => void) {
        this.ctx.save();
        proc(this.ctx);
        this.ctx.restore();
    }
    url_safe(proc: (url: string) => void) {
        const url = this.body.toDataURL();
        proc(url);
        URL.revokeObjectURL(url);
    }
}