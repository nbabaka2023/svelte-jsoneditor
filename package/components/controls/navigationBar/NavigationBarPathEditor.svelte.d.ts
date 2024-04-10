import { SvelteComponent } from "svelte";
import type { JSONPath } from 'immutable-json-patch';
import type { JSONPathParser, OnError } from '../../../types.js';
declare const __propDef: {
    props: {
        path: JSONPath;
        pathParser: JSONPathParser;
        onChange: (updatedPath: JSONPath) => void;
        onClose: () => void;
        onError: OnError;
        pathExists: (path: JSONPath) => boolean;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type NavigationBarPathEditorProps = typeof __propDef.props;
export type NavigationBarPathEditorEvents = typeof __propDef.events;
export type NavigationBarPathEditorSlots = typeof __propDef.slots;
export default class NavigationBarPathEditor extends SvelteComponent<NavigationBarPathEditorProps, NavigationBarPathEditorEvents, NavigationBarPathEditorSlots> {
}
export {};
