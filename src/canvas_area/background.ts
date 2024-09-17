export const background_image = (n: number, c?: [string, string]): HTMLCanvasElement => {
    if (c === undefined) {
        return background_image(n, ["#ffffff", "#eaf0f8"])
    }

    let i = 1;
    while (i < n) {
        i *= 2;
    }
    if (i === 1) {
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = c[0];
        ctx.fillRect(0, 0, 1, 1);
        return canvas;
    } else {
        return background_parts(i, c);
    }
}

const background_parts = (n: number, c: [string, string]): HTMLCanvasElement => {
    if (n === 2) {
        const canvas = document.createElement("canvas");
        canvas.width = 2;
        canvas.height = 2;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = c[0];
        ctx.fillRect(0, 0, 1, 1);
        ctx.fillRect(1, 1, 1, 1);
        ctx.fillStyle = c[1];
        ctx.fillRect(1, 0, 1, 1);
        ctx.fillRect(0, 1, 1, 1);
        return canvas;
    } else if (2 < n) {
        const canvas = document.createElement("canvas");
        canvas.width = n;
        canvas.height = n;
        const ctx = canvas.getContext("2d")!;
        const part = background_parts(Math.floor(n / 2), c);
        ctx.drawImage(part, 0, 0);
        ctx.drawImage(part, n / 2, 0);
        ctx.drawImage(part, 0, n / 2);
        ctx.drawImage(part, n / 2, n / 2)
        return canvas;
    } else {
        throw new Error("AAAAA");

    }
}
