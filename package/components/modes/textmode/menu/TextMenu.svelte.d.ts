import { SvelteComponent } from "svelte";
import type { OnRenderMenuInternal } from '../../../../types';
declare const __propDef: {
    props: {
        readOnly?: boolean | undefined;
        onFormat: () => boolean;
        onCompact: () => boolean;
        onSort: () => void;
        onTransform: () => void;
        onToggleSearch: () => void;
        onUndo: () => void;
        onRedo: () => void;
        canUndo: boolean;
        canRedo: boolean;
        canFormat: boolean;
        canCompact: boolean;
        canSort: boolean;
        canTransform: boolean;
        onRenderMenu: OnRenderMenuInternal;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type TextMenuProps = typeof __propDef.props;
export type TextMenuEvents = typeof __propDef.events;
export type TextMenuSlots = typeof __propDef.slots;
export default class TextMenu extends SvelteComponent<TextMenuProps, TextMenuEvents, TextMenuSlots> {
}
export {};
