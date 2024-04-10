import { SvelteComponent } from "svelte";
import type { JSONPath } from 'immutable-json-patch';
import type { OnPatch } from '../../../types.js';
declare const __propDef: {
    props: {
        path: JSONPath;
        value: string;
        readOnly: boolean;
        onPatch: OnPatch;
        focus: () => void;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type ColorPickerProps = typeof __propDef.props;
export type ColorPickerEvents = typeof __propDef.events;
export type ColorPickerSlots = typeof __propDef.slots;
export default class ColorPicker extends SvelteComponent<ColorPickerProps, ColorPickerEvents, ColorPickerSlots> {
}
export {};
