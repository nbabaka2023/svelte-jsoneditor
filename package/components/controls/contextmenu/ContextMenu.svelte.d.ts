import { SvelteComponent } from "svelte";
import type { ContextMenuItem } from '../../../types.js';
declare const __propDef: {
    props: {
        items: ContextMenuItem[];
        onRequestClose: () => void;
        tip: string | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type ContextMenuProps = typeof __propDef.props;
export type ContextMenuEvents = typeof __propDef.events;
export type ContextMenuSlots = typeof __propDef.slots;
export default class ContextMenu extends SvelteComponent<ContextMenuProps, ContextMenuEvents, ContextMenuSlots> {
}
export {};
