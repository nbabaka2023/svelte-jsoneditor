import { SvelteComponent } from "svelte";
import type { ExtendedSearchResultItem, JSONSelection, TreeModeContext } from '../../../types.js';
import type { JSONPath } from 'immutable-json-patch';
declare const __propDef: {
    props: {
        path: JSONPath;
        key: string;
        selection: JSONSelection | null;
        searchResultItems: ExtendedSearchResultItem[] | undefined;
        onUpdateKey: (oldKey: string, newKey: string) => string;
        context: TreeModeContext;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type JsonKeyProps = typeof __propDef.props;
export type JsonKeyEvents = typeof __propDef.events;
export type JsonKeySlots = typeof __propDef.slots;
export default class JsonKey extends SvelteComponent<JsonKeyProps, JsonKeyEvents, JsonKeySlots> {
}
export {};
