import { RefObject } from "preact";
import { useEffect, useRef, useState } from "preact/hooks"

export const ScrollBarHorizontal = ((props: {
    canvas_area: HTMLDivElement | null
    set_scroll_horizontal: (arg0: number) => void,
    canvas_width: number,
    area_width: number,
    zoom: number,
    zoom_reset_button_ref: RefObject<HTMLDivElement>,
}) => {
    const bar_ref = useRef<HTMLDivElement>(null);
    const bar_width = useRef(0);
    const scroll_width = useRef(0);
    let [scroll, set_scroll] = useState(0);
    let [is_dragging, set_dragging] = useState(false);
    const [_for_re_rend, _set_for_re_rend] = useState({});
    const re_rend = () => {
        _set_for_re_rend({})
    };

    const set_scroll_wrapped = (v_raw: number) => {
        const v = Math.max(-0.5, Math.min(0.5, v_raw))
        props.set_scroll_horizontal(v);
        set_scroll(v);
        scroll = v;
    };

    useEffect(() => {
        if (!props.canvas_area) return;
        const div = props.canvas_area;
        div.addEventListener("wheel", (e) => {
            if (e.deltaY != 0 && e.shiftKey && !e.ctrlKey) {
                set_scroll(v => { scroll = v; return v; })
                set_scroll_wrapped(scroll + Math.sign(e.deltaY) / 20 * props.zoom)
            }
        })
    }, [props.canvas_area]);

    useEffect(() => {
        bar_width.current = props.area_width ** 2 / (props.canvas_width * (props.zoom + 1));
        scroll_width.current = props.area_width * (1 - props.area_width / (props.canvas_width * (props.zoom + 1)));
        re_rend();
    }, [props.area_width, (props.canvas_width * props.zoom)]);

    useEffect(() => {
        const button = props.zoom_reset_button_ref.current;
        if (!button) return;
        button.addEventListener("click", () => {
            set_scroll(v => { scroll = v; return v; })
            set_scroll_wrapped(0);
        })
    }, []);

    useEffect(() => {
        const bar = bar_ref.current!;
        let start_ptr_x = 0;
        let start_bar_x = 0;
        bar.addEventListener("mousedown", e => {
            if (!is_dragging) {
                set_scroll(v => { scroll = v; return v; })
                start_ptr_x = e.pageX;
                start_bar_x = (scroll + 0.5) * scroll_width.current;
                set_dragging(true);
                is_dragging = true;
            }
        });
        document.addEventListener("mousemove", e => {
            if (is_dragging) {
                set_scroll(v => { scroll = v; return v; })
                set_scroll_wrapped((e.pageX - start_ptr_x + start_bar_x) / scroll_width.current - 0.5);
            }
        });
        document.addEventListener("mouseup", e => {
            if (is_dragging) {
                set_scroll(v => { scroll = v; return v; })
                set_scroll_wrapped((e.pageX - start_ptr_x + start_bar_x) / scroll_width.current - 0.5);
                set_dragging(false);
                is_dragging = false;
            }
        });
    }, []);

    return (
        <div
            ref={bar_ref}
            id="canvas_scroll_bar_horizontal"
            class="canvas_scroll_bar"
            style={{
                ...{
                    width: bar_width.current,
                    left: (scroll + 0.5) * scroll_width.current,
                },
                ...(is_dragging ? { backgroundColor: "#0008" } : {})
            }}
        ></div >
    )
})

export const ScrollBarVertical = ((props: {
    canvas_area: HTMLDivElement | null
    set_scroll_vertical: (arg0: number) => void,
    canvas_height: number,
    area_height: number,
    zoom: number,
    zoom_reset_button_ref: RefObject<HTMLDivElement>,
}) => {
    const bar_ref = useRef<HTMLDivElement>(null);
    const bar_height = useRef(0);
    const scroll_height = useRef(0);
    let [scroll, set_scroll] = useState(0);
    let [is_dragging, set_dragging] = useState(false);
    const [_for_re_rend, _set_for_re_rend] = useState({});
    const re_rend = () => {
        _set_for_re_rend({})
    };
    const set_scroll_wrapped = (v_raw: number) => {
        const v = Math.max(-0.5, Math.min(0.5, v_raw))
        props.set_scroll_vertical(v);
        set_scroll(v);
        scroll = v;
    };

    useEffect(() => {
        if (!props.canvas_area) return;
        const div = props.canvas_area;
        div.addEventListener("wheel", (e) => {
            if (props.canvas_height <= props.area_height) return;
            if (e.deltaY != 0 && !e.shiftKey && !e.ctrlKey) {
                set_scroll(v => { scroll = v; return v; })
                set_scroll_wrapped(scroll + Math.sign(e.deltaY) / 20 * props.zoom);
            }
        });
    }, [props.canvas_area]);

    useEffect(() => {
        bar_height.current = props.area_height ** 2 / (props.canvas_height * (props.zoom + 1));
        scroll_height.current = props.area_height * (1 - props.area_height / (props.canvas_height * (props.zoom + 1)));
        re_rend();
    }, [props.area_height, (props.canvas_height * props.zoom)]);

    useEffect(() => {
        const button = props.zoom_reset_button_ref.current;
        if (!button) return;
        button.addEventListener("click", () => {
            set_scroll(v => { scroll = v; return v; })
            set_scroll_wrapped(0);
        })
    }, [])

    useEffect(() => {
        const bar = bar_ref.current!;
        let start_ptr_y = 0;
        let start_bar_y = 0;
        bar.addEventListener("mousedown", e => {
            if (!is_dragging) {
                set_scroll(v => { scroll = v; return v; })
                start_ptr_y = e.pageY;
                start_bar_y = (scroll + 0.5) * scroll_height.current;
                set_dragging(true);
                is_dragging = true;
            }
        });
        document.addEventListener("mousemove", e => {
            if (is_dragging) {
                set_scroll_wrapped((e.pageY - start_ptr_y + start_bar_y) / scroll_height.current - 0.5);
            }
        });
        document.addEventListener("mouseup", e => {
            if (is_dragging) {
                set_scroll_wrapped((e.pageY - start_ptr_y + start_bar_y) / scroll_height.current - 0.5);
                set_dragging(false);
                is_dragging = false;
            }
        });
    }, []);
    return (
        <div
            ref={bar_ref}
            id="canvas_scroll_bar_vertical"
            class="canvas_scroll_bar"
            style={{
                ...{
                    height: bar_height.current,
                    top: (scroll + 0.5) * scroll_height.current,
                }, ...(is_dragging ? { backgroundColor: "#0008" } : {}),
                ...(props.canvas_height <= props.area_height ? { display: "none" } : { display: "block" })
            }}
        ></div>
    )
})
