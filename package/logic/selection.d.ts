import { type JSONPatchDocument, type JSONPath } from 'immutable-json-patch';
import type { AfterSelection, CaretPosition, DocumentState, InsideSelection, JSONEditorSelection, JSONParser, JSONSelection, KeySelection, MultiSelection, TextSelection, ValueSelection } from '../types.js';
import { SelectionType } from '../types.js';
export declare function isAfterSelection(selection: JSONEditorSelection | null): selection is AfterSelection;
export declare function isInsideSelection(selection: JSONEditorSelection | null): selection is InsideSelection;
export declare function isKeySelection(selection: JSONEditorSelection | null): selection is KeySelection;
export declare function isValueSelection(selection: JSONEditorSelection | null): selection is ValueSelection;
export declare function isMultiSelection(selection: JSONEditorSelection | null): selection is MultiSelection;
export declare function isMultiSelectionWithOneItem(selection: JSONEditorSelection | null): selection is MultiSelection;
export declare function isJSONSelection(selection: JSONEditorSelection | null): selection is JSONSelection;
export declare function isTextSelection(selection: JSONEditorSelection | null): selection is TextSelection;
/**
 * Expand a selection start and end into an array containing all paths
 * between (and including) start and end
 */
export declare function getSelectionPaths(json: unknown, selection: JSONSelection): JSONPath[];
/**
 * Expand a selection start and end into an array containing all paths
 * between (and including) start and end.
 *
 * The function iterates always from start to end, independent of the order
 * of focusPath and anchorPath.
 *
 * When the callback returns something other than undefined, the iteration is
 * canceled and the value returned by the callback is returned by iterateOverSelection.
 */
export declare function iterateOverSelection<T>(json: unknown | undefined, selection: JSONSelection | null, callback: (path: JSONPath) => void | undefined | T): void | undefined | T;
export declare function getParentPath(selection: JSONSelection): JSONPath;
export declare function getStartPath(json: unknown, selection: JSONSelection): JSONPath;
export declare function getEndPath(json: unknown, selection: JSONSelection): JSONPath;
export declare function isSelectionInsidePath(selection: JSONSelection, path: JSONPath): boolean;
export declare function getSelectionUp(json: unknown, documentState: DocumentState, keepAnchorPath?: boolean): JSONSelection | null;
export declare function getSelectionDown(json: unknown, documentState: DocumentState, keepAnchorPath?: boolean): JSONSelection | null;
/**
 * Get the next selection for a value inside the current object/array
 * If there is no next value, select AFTER.
 * Only applicable for ValueSelection
 */
export declare function getSelectionNextInside(json: unknown, documentState: DocumentState, path: JSONPath): JSONSelection | null;
/**
 * Find the caret position and its siblings for a given selection
 */
export declare function findCaretAndSiblings(json: unknown, documentState: DocumentState, includeInside: boolean): {
    next: CaretPosition | null;
    caret: CaretPosition | null;
    previous: CaretPosition | null;
};
export declare function getSelectionLeft(json: unknown, documentState: DocumentState, keepAnchorPath?: boolean, includeInside?: boolean): JSONSelection | null;
export declare function getSelectionRight(json: unknown, documentState: DocumentState, keepAnchorPath?: boolean, includeInside?: boolean): JSONSelection | null;
/**
 * Get a proper initial selection based on what is visible
 */
export declare function getInitialSelection(json: unknown, documentState: DocumentState): JSONSelection;
export declare function createSelectionFromOperations(json: unknown, operations: JSONPatchDocument): JSONSelection | null;
/**
 * Find the common path of two paths.
 * For example findCommonRoot(['arr', '1', 'name'], ['arr', '1', 'address', 'contact']) returns ['arr', '1']
 */
export declare function findSharedPath(path1: JSONPath, path2: JSONPath): JSONPath;
export declare function singleItemSelected(selection: JSONSelection | null): boolean;
export declare function findRootPath(json: unknown, selection: JSONSelection): JSONPath;
export declare function pathStartsWith(path: JSONPath, parentPath: JSONPath): boolean;
export declare function removeEditModeFromSelection(documentState: DocumentState): DocumentState;
export declare function createKeySelection(path: JSONPath, edit: boolean): KeySelection;
export declare function createValueSelection(path: JSONPath, edit: boolean): ValueSelection;
export declare function createInsideSelection(path: JSONPath): InsideSelection;
export declare function createAfterSelection(path: JSONPath): AfterSelection;
export declare function createMultiSelection(anchorPath: JSONPath, focusPath: JSONPath): MultiSelection;
/**
 * Turn selected contents into plain text partial JSON, usable for copying to
 * clipboard for example.
 */
export declare function selectionToPartialJson(json: unknown, selection: JSONSelection | null, indentation: number | string | undefined, parser: JSONParser): string | null;
export declare function isEditingSelection(selection: JSONSelection | null): boolean;
export declare function updateSelectionInDocumentState(documentState: DocumentState, selection: JSONSelection | null, replaceIfUndefined?: boolean): DocumentState;
/**
 * Create a selection which selects the root of the document
 */
export declare function selectAll(): JSONSelection;
export declare function hasSelectionContents(selection: JSONSelection | null): boolean;
/**
 * Test whether the current selection can be converted.
 * That is the case when the selection is a key/value, or a multi selection with only one path
 */
export declare function canConvert(selection: JSONSelection | null): boolean;
export declare function fromCaretPosition(caretPosition: CaretPosition): JSONSelection;
export declare function fromSelectionType(json: unknown, selectionType: SelectionType, path: JSONPath): JSONSelection;
export declare function selectionIfOverlapping(json: unknown | undefined, selection: JSONSelection | null, path: JSONPath): JSONSelection | null;
export declare function pathInSelection(json: unknown | undefined, selection: JSONSelection | null, path: JSONPath): boolean;
export declare function getFocusPath(selection: JSONSelection): JSONPath;
export declare function getAnchorPath(selection: JSONSelection): JSONPath;
