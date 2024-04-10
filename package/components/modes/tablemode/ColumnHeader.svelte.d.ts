import { SvelteComponent } from "svelte";
import type { JSONPath } from 'immutable-json-patch';
import type { SortedColumn } from '../../../types.js';
declare const __propDef: {
    props: {
        path: JSONPath;
        sortedColumn: SortedColumn | null;
        readOnly: boolean;
        onSort: (sortedColumn: SortedColumn) => void;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type ColumnHeaderProps = typeof __propDef.props;
export type ColumnHeaderEvents = typeof __propDef.events;
export type ColumnHeaderSlots = typeof __propDef.slots;
export default class ColumnHeader extends SvelteComponent<ColumnHeaderProps, ColumnHeaderEvents, ColumnHeaderSlots> {
}
export {};
