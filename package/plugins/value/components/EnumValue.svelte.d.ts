import { SvelteComponent } from "svelte";
import type { JSONPath } from 'immutable-json-patch';
import type { JSONParser, JSONSelection, OnPatch } from '../../../types.js';
declare const __propDef: {
    props: {
        path: JSONPath;
        value: unknown;
        parser: JSONParser;
        readOnly: boolean;
        selection: JSONSelection | null;
        onPatch: OnPatch;
        options: {
            value: unknown;
            text: string;
        }[];
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type EnumValueProps = typeof __propDef.props;
export type EnumValueEvents = typeof __propDef.events;
export type EnumValueSlots = typeof __propDef.slots;
export default class EnumValue extends SvelteComponent<EnumValueProps, EnumValueEvents, EnumValueSlots> {
}
export {};
