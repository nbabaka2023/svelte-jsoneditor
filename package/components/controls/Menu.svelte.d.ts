import { SvelteComponent } from "svelte";
import type { MenuItem } from '../../types';
declare const __propDef: {
    props: {
        items?: MenuItem[] | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        left: {};
        right: {};
    };
};
export type MenuProps = typeof __propDef.props;
export type MenuEvents = typeof __propDef.events;
export type MenuSlots = typeof __propDef.slots;
export default class Menu extends SvelteComponent<MenuProps, MenuEvents, MenuSlots> {
}
export {};
