import { SvelteComponent } from "svelte";
declare const __propDef: {
    props: {
        value: number;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type TimestampTagProps = typeof __propDef.props;
export type TimestampTagEvents = typeof __propDef.events;
export type TimestampTagSlots = typeof __propDef.slots;
export default class TimestampTag extends SvelteComponent<TimestampTagProps, TimestampTagEvents, TimestampTagSlots> {
}
export {};
