import { SvelteComponent } from "svelte";
declare const __propDef: {
    props: {
        title?: string | undefined;
        fullScreenButton?: boolean | undefined;
        fullscreen?: boolean | undefined;
        onClose?: (() => void) | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        actions: {};
    };
};
export type HeaderProps = typeof __propDef.props;
export type HeaderEvents = typeof __propDef.events;
export type HeaderSlots = typeof __propDef.slots;
export default class Header extends SvelteComponent<HeaderProps, HeaderEvents, HeaderSlots> {
}
export {};
