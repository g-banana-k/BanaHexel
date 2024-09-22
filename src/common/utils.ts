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
    public unwrap_or(d: T): T {
        if (this.is_ok()) return this.v as T;
        else return d;
    }
    public unwrap_or_else(f: () => T): T {
        if (this.is_ok()) return this.v as T;
        else return f();
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

export class Option<T> {
    private v: T | undefined;
    private is_some_flag: boolean;
    private constructor(v: T | undefined, is_some: boolean) {
        this.v = v;
        this.is_some_flag = is_some;
    }
    public unwrap(): T {
        if (this.is_some()) return this.v as T;
        else throw new Error(`unwrap`);
    }
    public unwrap_or(d: T): T {
        if (this.is_some()) return this.v as T;
        else return d
    }
    public unwrap_or_else(f: () => T): T {
        if (this.is_some()) return this.v as T;
        else return f();
    }
    public static Some<T>(v: T): Option<T> { return new Option<T>(v, true) }
    public static None<T>(): Option<T> { return new Option<T>(undefined, false) }
    public is_some(): boolean {
        return this.is_some_flag;
    }
    public on_some<U>(f: (arg0: T) => U): Option<U> {
        if (this.is_some()) {
            return Option.Some(f(this.unwrap()))
        } else {
            return Option.None()
        }
    }
    public static from_nullable<T>(v: T | null): Option<T> {
        if (v !== null) {
            return Option.Some<T>(v);
        } else {
            return Option.None();
        }
    }
}

export type UnRequired<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export class State<T> {
    private set_state: (updater: ((prev: T) => T) | T) => void;
    private cache: T
    constructor([initial, set_state]: [T, (updater: ((prev: T) => T) | T) => void]) {
        this.set_state = set_state;
        this.cache = initial;
    }
    val_local() {
        return this.cache;
    }
    val_global() {
        this.set_state(_ => { this.cache = _; return _ });
        return this.cache;
    }
    set(updater: ((prev: T) => T) | T) {
        this.set_state((prev) => {
            const new_v = typeof updater === "function"
                ? (updater as (prev: T) => T)(prev)
                : updater;
            this.cache = new_v;
            return new_v;
        });
    }
}
