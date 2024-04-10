import { SvelteComponent } from "svelte";
import type { ExtendedSearchResultItem, JSONParser, OnJSONSelect, ValueNormalization } from '../../../types.js';
import type { JSONPath } from 'immutable-json-patch';
declare const __propDef: {
    props: {
        path: JSONPath;
        value: unknown;
        readOnly: boolean;
        normalization: ValueNormalization;
        parser: JSONParser;
        onSelect: OnJSONSelect;
        searchResultItems: ExtendedSearchResultItem[] | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type ReadonlyValueProps = typeof __propDef.props;
export type ReadonlyValueEvents = typeof __propDef.events;
export type ReadonlyValueSlots = typeof __propDef.slots;
export default class ReadonlyValue extends SvelteComponent<ReadonlyValueProps, ReadonlyValueEvents, ReadonlyValueSlots> {
}
export {};
