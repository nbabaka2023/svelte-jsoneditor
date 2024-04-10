import { SvelteComponent } from "svelte";
import type { EditorState } from '@codemirror/state';
declare const __propDef: {
    props: {
        editorState: EditorState | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type StatusBarProps = typeof __propDef.props;
export type StatusBarEvents = typeof __propDef.events;
export type StatusBarSlots = typeof __propDef.slots;
export default class StatusBar extends SvelteComponent<StatusBarProps, StatusBarEvents, StatusBarSlots> {
}
export {};
