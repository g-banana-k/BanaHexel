export class Layer{
    body: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    preview: HTMLCanvasElement;
    uuid: string;
    constructor(bitmap: CanvasImageSource | undefined, canvas_size: { width: number, height: number }) {
        const canvas = document.createElement("canvas");
        canvas.width = canvas_size.width;
        canvas.height = canvas_size.height;
        const ctx = canvas.getContext("2d")!;
        if (bitmap) ctx.drawImage(bitmap, 0, 0);
        const preview = document.createElement("canvas");
        preview.width = 100;
        preview.height = 100;
        const preview_ctx = preview.getContext("2d")!;
        if (canvas.width < canvas.height) {
            preview_ctx.drawImage(canvas, 50 * (1 - canvas.width / canvas.height), 0, 100 * canvas.width / canvas.height, 100);
        } else {
            preview_ctx.drawImage(canvas, 0, 50 * (1 - canvas.height / canvas.width), 100, 100 * canvas.height / canvas.width);
        }
        this.body = canvas;
        this.ctx = ctx;
        this.preview = preview;
        this.uuid = crypto.randomUUID();
    }
    preview_update() {
        const preview_ctx = this.preview.getContext("2d")!;
        const canvas = this.body;
        preview_ctx.clearRect(0, 0, 100, 100); // 以前の内容をクリア
        if (canvas.width < canvas.height) {
            preview_ctx.drawImage(canvas, 50 * (1 - canvas.width / canvas.height), 0, 100 * canvas.width / canvas.height, 100);
        } else {
            preview_ctx.drawImage(canvas, 0, 50 * (1 - canvas.height / canvas.width), 100, 100 * canvas.height / canvas.width);
        }
    }
}