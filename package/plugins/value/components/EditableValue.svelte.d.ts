import { SvelteComponent } from "svelte";
import type { JSONPath } from 'immutable-json-patch';
import type { FindNextInside, JSONParser, OnFind, OnJSONSelect, OnPasteJson, OnPatch, ValueNormalization } from '../../../types.js';
declare const __propDef: {
    props: {
        path: JSONPath;
        value: unknown;
        parser: JSONParser;
        normalization: ValueNormalization;
        enforceString: boolean;
        onPatch: OnPatch;
        onPasteJson: OnPasteJson;
        onSelect: OnJSONSelect;
        onFind: OnFind;
        focus: () => void;
        findNextInside: FindNextInside;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type EditableValueProps = typeof __propDef.props;
export type EditableValueEvents = typeof __propDef.events;
export type EditableValueSlots = typeof __propDef.slots;
export default class EditableValue extends SvelteComponent<EditableValueProps, EditableValueEvents, EditableValueSlots> {
}
export {};
