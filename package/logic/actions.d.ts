import type { AfterPatchCallback, DocumentState, InsertType, JSONParser, JSONSelection, OnChange, OnChangeText, OnJSONSelect, OnPatch } from '../types';
import { type JSONPath } from 'immutable-json-patch';
export interface OnCutAction {
    json: unknown | undefined;
    documentState: DocumentState;
    indentation: string | number | undefined;
    readOnly: boolean;
    parser: JSONParser;
    onPatch: OnPatch;
}
export declare function onCut({ json, documentState, indentation, readOnly, parser, onPatch }: OnCutAction): Promise<void>;
export interface OnCopyAction {
    json: unknown;
    documentState: DocumentState;
    indentation: string | number | undefined;
    parser: JSONParser;
}
export declare function onCopy({ json, documentState, indentation, parser }: OnCopyAction): Promise<void>;
type RepairModalCallback = (text: string, onApply: (repairedText: string) => void) => void;
interface OnPasteAction {
    clipboardText: string;
    json: unknown | undefined;
    selection: JSONSelection | null;
    readOnly: boolean;
    parser: JSONParser;
    onPatch: OnPatch;
    onChangeText: OnChangeText;
    openRepairModal: RepairModalCallback;
}
export declare function onPaste({ clipboardText, json, selection, readOnly, parser, onPatch, onChangeText, openRepairModal }: OnPasteAction): void;
export interface OnRemoveAction {
    json: unknown | undefined;
    text: string | undefined;
    documentState: DocumentState;
    keepSelection: boolean;
    readOnly: boolean;
    onChange: OnChange;
    onPatch: OnPatch;
}
export declare function onRemove({ json, text, documentState, keepSelection, readOnly, onChange, onPatch }: OnRemoveAction): void;
export interface OnDuplicateRowAction {
    json: unknown | undefined;
    documentState: DocumentState;
    columns: JSONPath[];
    readOnly: boolean;
    onPatch: OnPatch;
}
/**
 * This function assumes that the json holds the Array that we're duplicating a row for,
 * it cannot duplicate something in some nested array
 */
export declare function onDuplicateRow({ json, documentState, columns, readOnly, onPatch }: OnDuplicateRowAction): void;
export interface OnInsertBeforeRowAction {
    json: unknown | undefined;
    documentState: DocumentState;
    columns: JSONPath[];
    readOnly: boolean;
    onPatch: OnPatch;
}
/**
 * This function assumes that the json holds the Array that we're duplicating a row for,
 * it cannot duplicate something in some nested array
 */
export declare function onInsertBeforeRow({ json, documentState, columns, readOnly, onPatch }: OnInsertBeforeRowAction): void;
export interface OnInsertAfterRowAction {
    json: unknown | undefined;
    documentState: DocumentState;
    columns: JSONPath[];
    readOnly: boolean;
    onPatch: OnPatch;
}
/**
 * This function assumes that the json holds the Array that we're duplicating a row for,
 * it cannot duplicate something in some nested array
 */
export declare function onInsertAfterRow({ json, documentState, columns, readOnly, onPatch }: OnInsertAfterRowAction): void;
export interface OnRemoveRowAction {
    json: unknown | undefined;
    documentState: DocumentState;
    columns: JSONPath[];
    readOnly: boolean;
    onPatch: OnPatch;
}
/**
 * This function assumes that the json holds the Array that we're duplicating a row for,
 * it cannot duplicate something in some nested array
 */
export declare function onRemoveRow({ json, documentState, columns, readOnly, onPatch }: OnRemoveRowAction): void;
export interface OnInsert {
    insertType: InsertType;
    selectInside: boolean;
    refJsonEditor: HTMLElement;
    json: unknown | undefined;
    selection: JSONSelection | null;
    readOnly: boolean;
    parser: JSONParser;
    onPatch: OnPatch;
    onReplaceJson: (updatedJson: unknown, afterPatch: AfterPatchCallback) => void;
}
export declare function onInsert({ insertType, selectInside, refJsonEditor, json, selection, readOnly, parser, onPatch, onReplaceJson }: OnInsert): void;
export interface OnInsertCharacter {
    char: string;
    selectInside: boolean;
    refJsonEditor: HTMLElement;
    json: unknown | undefined;
    selection: JSONSelection | null;
    readOnly: boolean;
    parser: JSONParser;
    onPatch: OnPatch;
    onReplaceJson: (updatedJson: unknown, afterPatch: AfterPatchCallback) => void;
    onSelect: OnJSONSelect;
}
export declare function onInsertCharacter({ char, selectInside, refJsonEditor, json, selection, readOnly, parser, onPatch, onReplaceJson, onSelect }: OnInsertCharacter): Promise<void>;
export {};
