import { type JSONPatchAdd, type JSONPatchCopy, type JSONPatchDocument, type JSONPatchMove, type JSONPatchRemove, type JSONPatchReplace, type JSONPath, type JSONPointer } from 'immutable-json-patch';
import type { CaretPosition, DocumentState, JSONParser, JSONPointerMap, JSONSelection, OnExpand, Section, VisibleSection } from '../types';
type OnCreateSelection = (json: unknown, documentState: DocumentState) => JSONSelection;
export type CreateDocumentStateProps = {
    json: unknown | undefined;
    expand?: OnExpand;
    select?: OnCreateSelection;
};
export declare function createDocumentState(props?: CreateDocumentStateProps): DocumentState;
export declare function getVisibleSections(documentState: DocumentState, pointer: JSONPointer): VisibleSection[];
/**
 * Invoke a callback function for every visible item in the array
 */
export declare function forEachVisibleIndex(jsonArray: Array<unknown>, visibleSections: VisibleSection[], callback: (index: number) => void): void;
/**
 * Expand all nodes on given path
 * The end of the path itself is not expanded
 */
export declare function expandPath(json: unknown, documentState: DocumentState, path: JSONPath): DocumentState;
/**
 * Expand a node, end expand its children according to the provided callback
 * Nodes that are already expanded will be left untouched
 */
export declare function expandWithCallback(json: unknown | undefined, documentState: DocumentState, path: JSONPath, expandedCallback: OnExpand): DocumentState;
export declare function expandSingleItem(documentState: DocumentState, path: JSONPath): DocumentState;
export declare function collapsePath(documentState: DocumentState, path: JSONPath): DocumentState;
export declare function setEnforceString(documentState: DocumentState, pointer: JSONPointer, enforceString: boolean): DocumentState;
/**
 * Expand a section of items in an array
 */
export declare function expandSection(json: unknown, documentState: DocumentState, pointer: JSONPointer, section: Section): DocumentState;
export declare function syncKeys(actualKeys: string[], prevKeys?: string[]): string[];
/**
 * Apply patch operations to both json and state
 */
export declare function documentStatePatch(json: unknown, documentState: DocumentState, operations: JSONPatchDocument): {
    json: unknown;
    documentState: DocumentState;
};
export declare function documentStateAdd(json: unknown, documentState: DocumentState, operation: JSONPatchAdd): DocumentState;
export declare function documentStateRemove(updatedJson: unknown, documentState: DocumentState, operation: JSONPatchRemove): DocumentState;
export declare function documentStateReplace(updatedJson: unknown, documentState: DocumentState, operation: JSONPatchReplace): DocumentState;
export declare function documentStateMoveOrCopy(updatedJson: unknown, documentState: DocumentState, operation: JSONPatchCopy | JSONPatchMove): DocumentState;
/**
 * Delete a path from a PathsMap. Will delete the path and its child paths
 * IMPORTANT: will NOT shift array items when an array item is removed, use shiftPath for that
 */
export declare function deletePath<T>(map: JSONPointerMap<T>, path: JSONPath): JSONPointerMap<T>;
export declare function filterPath<T>(map: JSONPointerMap<T>, pointer: JSONPointer): JSONPointerMap<T>;
export declare function mergePaths<T>(a: JSONPointerMap<T>, b: JSONPointerMap<T>): JSONPointerMap<T>;
export declare function movePath<T>(map: JSONPointerMap<T>, changePointer: (pointer: JSONPointer) => JSONPointer): JSONPointerMap<T>;
export declare function shiftPath<T>(map: JSONPointerMap<T>, path: JSONPath, index: number, offset: number): JSONPointerMap<T>;
export declare function cleanupNonExistingPaths<T>(json: unknown, map: JSONPointerMap<T>): JSONPointerMap<T>;
/**
 * Update a value in a PathsMap.
 * When the path exists, the callback will be invoked.
 * When the path does not exist, the callback is not invoked.
 */
export declare function updateInPathsMap<T>(map: JSONPointerMap<T>, pointer: JSONPointer, callback: (value: T) => T): JSONPointerMap<T>;
/**
 * Shift visible sections in an Array with a specified offset
 */
export declare function shiftVisibleSections(visibleSections: VisibleSection[], index: number, offset: number): VisibleSection[];
export declare function getEnforceString(value: unknown, enforceStringMap: JSONPointerMap<boolean> | undefined, pointer: JSONPointer, parser: JSONParser): boolean;
export declare function getNextKeys(keys: string[], key: string, includeKey?: boolean): string[];
/**
 * Get all paths which are visible and rendered
 */
export declare function getVisiblePaths(json: unknown, documentState: DocumentState): JSONPath[];
/**
 * Get all caret position which are visible and rendered:
 * before a node, at a key, at a value, appending an object/array
 */
export declare function getVisibleCaretPositions(json: unknown, documentState: DocumentState, includeInside?: boolean): CaretPosition[];
/**
 * Find the previous visible path.
 * This can be the last child of the previous object or array, or the parent of a first entry.
 */
export declare function getPreviousVisiblePath(json: unknown, documentState: DocumentState, path: JSONPath): JSONPath | null;
/**
 * Find the next visible path.
 * This can be the next parent entry.
 */
export declare function getNextVisiblePath(json: unknown, documentState: DocumentState, path: JSONPath): JSONPath | null;
/**
 * Expand recursively when the expanded contents is small enough,
 * else expand in a minimalistic way
 */
export declare function expandRecursive(json: unknown, documentState: DocumentState, path: JSONPath): DocumentState;
export declare function expandMinimal(path: JSONPath): boolean;
export declare function expandAll(): boolean;
export declare function getDefaultExpand(json: unknown): OnExpand;
export {};
