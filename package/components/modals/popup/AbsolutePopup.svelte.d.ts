import { SvelteComponent } from "svelte";
declare const __propDef: {
    props: Record<string, never>;
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export type AbsolutePopupProps = typeof __propDef.props;
export type AbsolutePopupEvents = typeof __propDef.events;
export type AbsolutePopupSlots = typeof __propDef.slots;
export default class AbsolutePopup extends SvelteComponent<AbsolutePopupProps, AbsolutePopupEvents, AbsolutePopupSlots> {
}
export {};
