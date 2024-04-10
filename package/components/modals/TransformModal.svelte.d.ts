import { SvelteComponent } from "svelte";
import type { JSONPath } from 'immutable-json-patch';
import type { JSONParser, JSONPathParser, OnChangeQueryLanguage, OnClassName, OnPatch, OnRenderContextMenuInternal, OnRenderMenuInternal, OnRenderValue, QueryLanguage } from '../../types.js';
declare const __propDef: {
    props: {
        id?: string | undefined;
        json: unknown;
        rootPath?: JSONPath | undefined;
        indentation: number | string;
        escapeControlCharacters: boolean;
        escapeUnicodeCharacters: boolean;
        parser: JSONParser;
        parseMemoizeOne: JSONParser['parse'];
        validationParser: JSONParser;
        pathParser: JSONPathParser;
        queryLanguages: QueryLanguage[];
        queryLanguageId: string;
        onChangeQueryLanguage: OnChangeQueryLanguage;
        onRenderValue: OnRenderValue;
        onRenderMenu: OnRenderMenuInternal;
        onRenderContextMenu: OnRenderContextMenuInternal;
        onClassName: OnClassName;
        onTransform: OnPatch;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type TransformModalProps = typeof __propDef.props;
export type TransformModalEvents = typeof __propDef.events;
export type TransformModalSlots = typeof __propDef.slots;
export default class TransformModal extends SvelteComponent<TransformModalProps, TransformModalEvents, TransformModalSlots> {
}
export {};
