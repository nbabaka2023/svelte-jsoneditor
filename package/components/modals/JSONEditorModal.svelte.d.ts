import { SvelteComponent } from "svelte";
import type { JSONPath } from 'immutable-json-patch';
import type { Content, JSONParser, JSONPathParser, OnClassName, OnPatch, OnRenderContextMenu, OnRenderMenu, OnRenderValue, OnSortModal, OnTransformModal, Validator } from '../../types';
declare const __propDef: {
    props: {
        content: Content;
        path: JSONPath;
        onPatch: OnPatch;
        readOnly: boolean;
        indentation: number | string;
        tabSize: number;
        mainMenuBar: boolean;
        navigationBar: boolean;
        statusBar: boolean;
        askToFormat: boolean;
        escapeControlCharacters: boolean;
        escapeUnicodeCharacters: boolean;
        flattenColumns: boolean;
        parser: JSONParser;
        validator: Validator | null;
        validationParser: JSONParser;
        pathParser: JSONPathParser;
        onRenderValue: OnRenderValue;
        onClassName: OnClassName;
        onRenderMenu: OnRenderMenu;
        onRenderContextMenu: OnRenderContextMenu;
        onSortModal: OnSortModal;
        onTransformModal: OnTransformModal;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type JsonEditorModalProps = typeof __propDef.props;
export type JsonEditorModalEvents = typeof __propDef.events;
export type JsonEditorModalSlots = typeof __propDef.slots;
export default class JsonEditorModal extends SvelteComponent<JsonEditorModalProps, JsonEditorModalEvents, JsonEditorModalSlots> {
}
export {};
