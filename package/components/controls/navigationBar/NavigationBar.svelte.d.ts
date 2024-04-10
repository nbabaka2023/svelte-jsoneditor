import { SvelteComponent } from "svelte";
import type { JSONPathParser, JSONSelection, OnError, OnJSONSelect } from '../../../types.js';
declare const __propDef: {
    props: {
        json: unknown;
        selection: JSONSelection | null;
        onSelect: OnJSONSelect;
        onError: OnError;
        pathParser: JSONPathParser;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type NavigationBarProps = typeof __propDef.props;
export type NavigationBarEvents = typeof __propDef.events;
export type NavigationBarSlots = typeof __propDef.slots;
export default class NavigationBar extends SvelteComponent<NavigationBarProps, NavigationBarEvents, NavigationBarSlots> {
}
export {};
