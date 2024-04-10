import { SvelteComponent } from "svelte";
declare const __propDef: {
    props: {
        count: number;
        maxSampleCount: number;
        onRefresh: () => void;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type RefreshColumnHeaderProps = typeof __propDef.props;
export type RefreshColumnHeaderEvents = typeof __propDef.events;
export type RefreshColumnHeaderSlots = typeof __propDef.slots;
export default class RefreshColumnHeader extends SvelteComponent<RefreshColumnHeaderProps, RefreshColumnHeaderEvents, RefreshColumnHeaderSlots> {
}
export {};
