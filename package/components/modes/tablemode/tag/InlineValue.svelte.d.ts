import { SvelteComponent } from "svelte";
import type { JSONPath } from 'immutable-json-patch';
import type { JSONParser } from '../../../../types';
declare const __propDef: {
    props: {
        path: JSONPath;
        value: unknown;
        parser: JSONParser;
        isSelected: boolean;
        containsSearchResult: boolean;
        containsActiveSearchResult: boolean;
        onEdit: (path: JSONPath) => void;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type InlineValueProps = typeof __propDef.props;
export type InlineValueEvents = typeof __propDef.events;
export type InlineValueSlots = typeof __propDef.slots;
export default class InlineValue extends SvelteComponent<InlineValueProps, InlineValueEvents, InlineValueSlots> {
}
export {};
