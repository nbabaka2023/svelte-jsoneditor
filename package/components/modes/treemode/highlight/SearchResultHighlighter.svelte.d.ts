import { SvelteComponent } from "svelte";
import type { ExtendedSearchResultItem } from '../../../../types';
declare const __propDef: {
    props: {
        text: string;
        searchResultItems: ExtendedSearchResultItem[];
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type SearchResultHighlighterProps = typeof __propDef.props;
export type SearchResultHighlighterEvents = typeof __propDef.events;
export type SearchResultHighlighterSlots = typeof __propDef.slots;
export default class SearchResultHighlighter extends SvelteComponent<SearchResultHighlighterProps, SearchResultHighlighterEvents, SearchResultHighlighterSlots> {
}
export {};
