import { SvelteComponent } from "svelte";
import type { OnContextMenu } from '../../../types';
declare const __propDef: {
    props: {
        selected: boolean;
        onContextMenu: OnContextMenu;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type ContextMenuPointerProps = typeof __propDef.props;
export type ContextMenuPointerEvents = typeof __propDef.events;
export type ContextMenuPointerSlots = typeof __propDef.slots;
export default class ContextMenuPointer extends SvelteComponent<ContextMenuPointerProps, ContextMenuPointerEvents, ContextMenuPointerSlots> {
}
export {};
