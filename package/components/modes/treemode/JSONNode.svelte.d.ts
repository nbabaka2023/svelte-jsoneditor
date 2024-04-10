import { SvelteComponent } from "svelte";
import type { JSONPath } from 'immutable-json-patch';
import type { ExtendedSearchResultItem, JSONPointerMap, JSONSelection, NestedValidationError, TreeModeContext, VisibleSection } from '../../../types';
declare const __propDef: {
    props: {
        value: unknown;
        path: JSONPath;
        expandedMap: JSONPointerMap<boolean> | undefined;
        enforceStringMap: JSONPointerMap<boolean> | undefined;
        visibleSectionsMap: JSONPointerMap<VisibleSection[]> | undefined;
        validationErrorsMap: JSONPointerMap<NestedValidationError> | undefined;
        searchResultItemsMap: JSONPointerMap<ExtendedSearchResultItem[]> | undefined;
        selection: JSONSelection | null;
        context: TreeModeContext;
        onDragSelectionStart: (event: MouseEvent & {
            currentTarget: EventTarget & HTMLDivElement;
        }) => void;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        identifier: {};
    };
};
export type JsonNodeProps = typeof __propDef.props;
export type JsonNodeEvents = typeof __propDef.events;
export type JsonNodeSlots = typeof __propDef.slots;
export default class JsonNode extends SvelteComponent<JsonNodeProps, JsonNodeEvents, JsonNodeSlots> {
}
export {};
