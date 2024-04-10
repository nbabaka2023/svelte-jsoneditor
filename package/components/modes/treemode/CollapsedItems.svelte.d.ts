import { SvelteComponent } from "svelte";
import type { JSONSelection, Section, VisibleSection, JSONEditorContext } from '../../../types.js';
import type { JSONPath } from 'immutable-json-patch';
declare const __propDef: {
    props: {
        visibleSections: VisibleSection[];
        sectionIndex: number;
        total: number;
        path: JSONPath;
        selection: JSONSelection | null;
        onExpandSection: (path: JSONPath, section: Section) => void;
        context: JSONEditorContext;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type CollapsedItemsProps = typeof __propDef.props;
export type CollapsedItemsEvents = typeof __propDef.events;
export type CollapsedItemsSlots = typeof __propDef.slots;
export default class CollapsedItems extends SvelteComponent<CollapsedItemsProps, CollapsedItemsEvents, CollapsedItemsSlots> {
}
export {};
