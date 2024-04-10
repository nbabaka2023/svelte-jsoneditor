import { SvelteComponent } from "svelte";
declare const __propDef: {
    props: {
        items: (string | number)[];
        selectedItem: string | number;
        onSelect: (item: string | number) => void;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type NavigationBarDropdownProps = typeof __propDef.props;
export type NavigationBarDropdownEvents = typeof __propDef.events;
export type NavigationBarDropdownSlots = typeof __propDef.slots;
export default class NavigationBarDropdown extends SvelteComponent<NavigationBarDropdownProps, NavigationBarDropdownEvents, NavigationBarDropdownSlots> {
}
export {};
