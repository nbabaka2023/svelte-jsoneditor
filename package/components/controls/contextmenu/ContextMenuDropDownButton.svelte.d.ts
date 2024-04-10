import { SvelteComponent } from "svelte";
import type { MenuDropDownButton } from '../../../types';
declare const __propDef: {
    props: {
        item: MenuDropDownButton;
        className?: string | undefined;
        onRequestClose: () => void;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type ContextMenuDropDownButtonProps = typeof __propDef.props;
export type ContextMenuDropDownButtonEvents = typeof __propDef.events;
export type ContextMenuDropDownButtonSlots = typeof __propDef.slots;
export default class ContextMenuDropDownButton extends SvelteComponent<ContextMenuDropDownButtonProps, ContextMenuDropDownButtonEvents, ContextMenuDropDownButtonSlots> {
}
export {};
