import { SvelteComponent } from "svelte";
import type { JSONPath } from 'immutable-json-patch';
import type { OnPatch } from '../../../types.js';
declare const __propDef: {
    props: {
        path: JSONPath;
        value: unknown;
        readOnly: boolean;
        onPatch: OnPatch;
        focus: () => void;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type BooleanToggleProps = typeof __propDef.props;
export type BooleanToggleEvents = typeof __propDef.events;
export type BooleanToggleSlots = typeof __propDef.slots;
export default class BooleanToggle extends SvelteComponent<BooleanToggleProps, BooleanToggleEvents, BooleanToggleSlots> {
}
export {};
