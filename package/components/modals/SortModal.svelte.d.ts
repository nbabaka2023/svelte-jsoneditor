import { SvelteComponent } from "svelte";
import type { JSONPath } from 'immutable-json-patch';
import type { OnSort } from '../../types.js';
declare const __propDef: {
    props: {
        id: string;
        json: unknown;
        rootPath: JSONPath;
        onSort: OnSort;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type SortModalProps = typeof __propDef.props;
export type SortModalEvents = typeof __propDef.events;
export type SortModalSlots = typeof __propDef.slots;
export default class SortModal extends SvelteComponent<SortModalProps, SortModalEvents, SortModalSlots> {
}
export {};
