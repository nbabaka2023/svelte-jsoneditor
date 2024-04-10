import { SvelteComponent } from "svelte";
import type { MenuButton } from '../../../types';
declare const __propDef: {
    props: {
        item: MenuButton;
        className?: string | undefined;
        onRequestClose: () => void;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type ContextMenuButtonProps = typeof __propDef.props;
export type ContextMenuButtonEvents = typeof __propDef.events;
export type ContextMenuButtonSlots = typeof __propDef.slots;
export default class ContextMenuButton extends SvelteComponent<ContextMenuButtonProps, ContextMenuButtonEvents, ContextMenuButtonSlots> {
}
export {};
