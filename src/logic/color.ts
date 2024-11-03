
export const rgba_to_code = (r: number, g: number, b: number, a: number): string =>
    `#${('00' + to_hx(r)).slice(-2)}${('00' + to_hx(g)).slice(-2)}${('00' + to_hx(b)).slice(-2)}${('00' + to_hx(a)).slice(-2)}`

export const code_to_rgba = (c: string): [number, number, number, number] => {
    const d = code_normalize(c);
    return [
        from_hx(d.substring(0, 2)) || 0,
        from_hx(d.substring(2, 4)) || 0,
        from_hx(d.substring(4, 6)) || 0,
        from_hx(d.substring(6, 8)) || 0,
    ]
}

export const code_normalize = (c: string): string => {
    let d = c[0] === "#" ? c.substring(1, c.length) : c;
    while (d.length < 3) d = `0${d}`;
    if (d.length == 3) {
        d = `${d}f`
    }
    if (d.length == 4) {
        d = `${d[0]}${d[0]}${d[1]}${d[1]}${d[2]}${d[2]}${d[3]}${d[3]}`;
    }
    while (d.length < 6) d = `0${d}`;
    if (d.length == 6) {
        d = `${d}ff`
    }
    while (d.length < 8) d = `0${d}`;
    if (8 < d.length) d = d.substring(0, 8);
    return d
}


export const to_hx = (n: number) => n.toString(16);
export const from_hx = (s: string) => parseInt(s, 16);