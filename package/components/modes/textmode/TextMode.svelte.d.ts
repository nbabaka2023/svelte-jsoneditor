import { SvelteComponent } from "svelte";
import type { JSONPatchDocument } from 'immutable-json-patch';
import type { Content, ContentErrors, JSONEditorSelection, JSONParser, JSONPatchResult, OnBlur, OnChange, OnChangeMode, OnError, OnFocus, OnRenderMenuInternal, OnSelect, OnSortModal, OnTransformModal, TransformModalOptions, Validator } from '../../../types.js';
declare const __propDef: {
    props: {
        readOnly: boolean;
        mainMenuBar: boolean;
        statusBar: boolean;
        askToFormat: boolean;
        externalContent: Content;
        externalSelection: JSONEditorSelection | null;
        indentation: number | string;
        tabSize: number;
        escapeUnicodeCharacters: boolean;
        parser: JSONParser;
        validator: Validator | null;
        validationParser: JSONParser;
        onChange: OnChange;
        onChangeMode: OnChangeMode;
        onSelect: OnSelect;
        onError: OnError;
        onFocus: OnFocus;
        onBlur: OnBlur;
        onRenderMenu: OnRenderMenuInternal;
        onSortModal: OnSortModal;
        onTransformModal: OnTransformModal;
        focus?: (() => void) | undefined;
        patch?: ((operations: JSONPatchDocument) => JSONPatchResult) | undefined;
        handlePatch?: ((operations: JSONPatchDocument, emitChange: boolean) => JSONPatchResult) | undefined;
        openTransformModal?: (({ id, rootPath, onTransform, onClose }: TransformModalOptions) => void) | undefined;
        refresh?: (() => Promise<void>) | undefined;
        validate?: (() => ContentErrors | null) | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type TextModeProps = typeof __propDef.props;
export type TextModeEvents = typeof __propDef.events;
export type TextModeSlots = typeof __propDef.slots;
export default class TextMode extends SvelteComponent<TextModeProps, TextModeEvents, TextModeSlots> {
    get focus(): () => void;
    get patch(): (operations: JSONPatchDocument) => JSONPatchResult;
    get handlePatch(): (operations: JSONPatchDocument, emitChange: boolean) => JSONPatchResult;
    get openTransformModal(): ({ id, rootPath, onTransform, onClose }: TransformModalOptions) => void;
    get refresh(): () => Promise<void>;
    get validate(): () => ContentErrors | null;
}
export {};
