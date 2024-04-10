import { SvelteComponent } from "svelte";
declare const __propDef: {
    props: Record<string, never>;
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type CopyPasteModalProps = typeof __propDef.props;
export type CopyPasteModalEvents = typeof __propDef.events;
export type CopyPasteModalSlots = typeof __propDef.slots;
export default class CopyPasteModal extends SvelteComponent<CopyPasteModalProps, CopyPasteModalEvents, CopyPasteModalSlots> {
}
export {};
