import { SvelteComponent } from "svelte";
import type { MenuButton } from '../../types.js';
declare const __propDef: {
    props: {
        items?: MenuButton[] | undefined;
        title?: string | undefined;
        width?: string | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        defaultItem: {};
    };
};
export type DropdownButtonProps = typeof __propDef.props;
export type DropdownButtonEvents = typeof __propDef.events;
export type DropdownButtonSlots = typeof __propDef.slots;
export default class DropdownButton extends SvelteComponent<DropdownButtonProps, DropdownButtonEvents, DropdownButtonSlots> {
}
export {};
