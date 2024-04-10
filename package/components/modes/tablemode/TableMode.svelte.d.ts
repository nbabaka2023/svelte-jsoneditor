import { SvelteComponent } from "svelte";
import type { AfterPatchCallback, Content, ContentErrors, JSONEditorSelection, JSONParser, JSONPatchResult, OnBlur, OnChange, OnChangeMode, OnFocus, OnJSONEditorModal, OnRenderContextMenuInternal, OnRenderMenuInternal, OnRenderValue, OnSelect, OnSortModal, OnTransformModal, TransformModalOptions, Validator } from '../../../types';
import { type JSONPatchDocument, type JSONPath } from 'immutable-json-patch';
declare const __propDef: {
    props: {
        readOnly: boolean;
        externalContent: Content;
        externalSelection: JSONEditorSelection | null;
        mainMenuBar: boolean;
        escapeControlCharacters: boolean;
        escapeUnicodeCharacters: boolean;
        flattenColumns: boolean;
        parser: JSONParser;
        parseMemoizeOne: JSONParser['parse'];
        validator: Validator | null;
        validationParser: JSONParser;
        indentation: number | string;
        onChange: OnChange;
        onChangeMode: OnChangeMode;
        onSelect: OnSelect;
        onRenderValue: OnRenderValue;
        onRenderMenu: OnRenderMenuInternal;
        onRenderContextMenu: OnRenderContextMenuInternal;
        onFocus: OnFocus;
        onBlur: OnBlur;
        onSortModal: OnSortModal;
        onTransformModal: OnTransformModal;
        onJSONEditorModal: OnJSONEditorModal;
        validate?: (() => ContentErrors | null) | undefined;
        patch?: ((operations: JSONPatchDocument, afterPatch?: AfterPatchCallback) => JSONPatchResult) | undefined;
        focus?: (() => void) | undefined;
        acceptAutoRepair?: (() => {
            json: unknown;
            text: string | undefined;
        }) | undefined;
        scrollTo?: ((path: JSONPath, scrollToWhenVisible?: boolean) => Promise<void>) | undefined;
        findElement?: ((path: JSONPath) => Element | null) | undefined;
        openTransformModal?: ((options: TransformModalOptions) => void) | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type TableModeProps = typeof __propDef.props;
export type TableModeEvents = typeof __propDef.events;
export type TableModeSlots = typeof __propDef.slots;
export default class TableMode extends SvelteComponent<TableModeProps, TableModeEvents, TableModeSlots> {
    get validate(): () => ContentErrors | null;
    get patch(): (operations: JSONPatchDocument, afterPatch?: AfterPatchCallback | undefined) => JSONPatchResult;
    get focus(): () => void;
    get acceptAutoRepair(): () => {
        json: unknown;
        text: string | undefined;
    };
    get scrollTo(): (path: JSONPath, scrollToWhenVisible?: boolean) => Promise<void>;
    get findElement(): (path: JSONPath) => Element | null;
    get openTransformModal(): (options: TransformModalOptions) => void;
}
export {};
