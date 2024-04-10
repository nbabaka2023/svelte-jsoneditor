import { SvelteComponent } from "svelte";
import type { DocumentState, JSONParser, OnPatch, SearchResult } from '../../types.js';
import type { JSONPath } from 'immutable-json-patch';
declare const __propDef: {
    props: {
        json: unknown;
        documentState: DocumentState;
        parser: JSONParser;
        showSearch: boolean;
        showReplace: boolean;
        readOnly: boolean;
        columns: JSONPath[] | undefined;
        onSearch: (result: SearchResult | undefined) => void;
        onFocus: (path: JSONPath) => Promise<void>;
        onPatch: OnPatch;
        onClose: () => void;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type SearchBoxProps = typeof __propDef.props;
export type SearchBoxEvents = typeof __propDef.events;
export type SearchBoxSlots = typeof __propDef.slots;
export default class SearchBox extends SvelteComponent<SearchBoxProps, SearchBoxEvents, SearchBoxSlots> {
}
export {};
