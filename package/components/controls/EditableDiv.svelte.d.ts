import { SvelteComponent } from "svelte";
import type { OnFind, OnPaste } from '../../types';
import { UpdateSelectionAfterChange } from '../../types';
declare const __propDef: {
    props: {
        value: string;
        shortText?: boolean | undefined;
        onChange: (newValue: string, updateSelection: UpdateSelectionAfterChange) => void;
        onCancel: () => void;
        onFind: OnFind;
        onPaste?: OnPaste | undefined;
        onValueClass?: ((value: string) => string) | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type EditableDivProps = typeof __propDef.props;
export type EditableDivEvents = typeof __propDef.events;
export type EditableDivSlots = typeof __propDef.slots;
export default class EditableDiv extends SvelteComponent<EditableDivProps, EditableDivEvents, EditableDivSlots> {
}
export {};
