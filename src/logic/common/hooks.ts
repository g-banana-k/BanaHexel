import { useEffect } from "react"

export const useAsyncEffect = (effect: () => Promise<unknown>, deps?: unknown[]) => {
    useEffect(() => { effect() }, deps)
}