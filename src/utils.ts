export class Result<T, E> {
    private v: T | E;
    private is_ok_flag: boolean;
    private constructor(v: T | E, is_ok: boolean) {
        this.v = v;
        this.is_ok_flag = is_ok;
    }
    public unwrap(): T {
        if (this.is_ok()) return this.v as T;
        else throw new Error(`unwrap: ${this.v as E}`);
    }
    public unwrap_err(): E {
        if (this.is_ok()) throw new Error(`${this.v as T}`);
        else return this.v as E
    }
    public static Ok<T, E>(v: T): Result<T, E> { return new Result<T, E>(v, true) }
    public static Err<T, E>(v: E): Result<T, E> { return new Result<T, E>(v, false) }
    public is_ok(): boolean {
        return this.is_ok_flag;
    }
    public on_ok<U>(f: (arg0: T) => U): Result<U, E> {
        if (this.is_ok()) {
            return Result.Ok(f(this.unwrap()))
        } else {
            return Result.Err(this.unwrap_err())
        }
    }
    public on_err<F>(f: (arg0: E) => F): Result<T, F> {
        if (this.is_ok()) {
            return Result.Ok(this.unwrap())
        } else {
            return Result.Err(f(this.unwrap_err()))
        }
    }
    public static from_try_catch<T>(f: () => T): Result<T, unknown> {
        try {
            const v = f();
            return Result.Ok(v)
        } catch (e) {
            return Result.Err(e)
        }
    }
    public static async from_try_catch_async<T>(f: () => Promise<T>): Promise<Result<T, unknown>> {
        try {
            const v = await f();
            return Result.Ok(v)
        } catch (e) {
            return Result.Err(e)
        }
    }
}

type state_setter<T> = T | ((arg0: T) => T);

/** Tが関数型だとバグります */
export class State<T> {
    private v: T;
    private f: (arg0: state_setter<T>) => void;
    public constructor(v: [T, (arg0: state_setter<T>) => void]) {
        this.v = v[0];
        this.f = v[1];
    }
    public set(u: state_setter<T>) {
        if (typeof u === "function" && u.length === 1) {
            this.f(u);
            this.f((_) => { this.v = _; return _ })
        } else {
            this.v = u as T;
        }
    }
    public val() {
        return this.v
    }
}
