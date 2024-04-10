import { SvelteComponent } from "svelte";
import type { JSONEditorContext, JSONSelection, SearchResultItem } from '../../../types.js';
import type { JSONPath } from 'immutable-json-patch';
declare const __propDef: {
    props: {
        path: JSONPath;
        value: unknown;
        context: JSONEditorContext;
        enforceString: boolean;
        selection: JSONSelection | null;
        searchResultItems: SearchResultItem[] | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type JsonValueProps = typeof __propDef.props;
export type JsonValueEvents = typeof __propDef.events;
export type JsonValueSlots = typeof __propDef.slots;
export default class JsonValue extends SvelteComponent<JsonValueProps, JsonValueEvents, JsonValueSlots> {
}
export {};
