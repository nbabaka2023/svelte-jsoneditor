import { type JSONPatchAdd, type JSONPatchCopy, type JSONPatchDocument, type JSONPatchOperation, type JSONPath } from 'immutable-json-patch';
import type { ClipboardValues, DragInsideAction, JSONParser, JSONSelection } from '../types';
/**
 * Create a JSONPatch for an insert operation.
 *
 * This function needs the current data in order to be able to determine
 * a unique property name for the inserted node in case of duplicating
 * and object property
 */
export declare function insertBefore(json: unknown, path: JSONPath, values: ClipboardValues): JSONPatchDocument;
/**
 * Create a JSONPatch for an append operation. The values will be appended
 * to the end of the array or object.
 *
 * This function needs the current data in order to be able to determine
 * a unique property name for the inserted node in case of duplicating
 * and object property
 */
export declare function append(json: unknown, path: JSONPath, values: ClipboardValues): JSONPatchDocument;
/**
 * Rename an object key
 * Not applicable to arrays
 */
export declare function rename(parentPath: JSONPath, keys: string[], oldKey: string, newKey: string): JSONPatchDocument;
/**
 * Create a JSONPatch for an insert operation.
 *
 * This function needs the current data in order to be able to determine
 * a unique property name for the inserted node in case of duplicating
 * and object property
 */
export declare function replace(json: unknown, paths: JSONPath[], values: ClipboardValues): JSONPatchDocument;
/**
 * Create a JSONPatch for a duplicate action.
 *
 * This function needs the current data in order to be able to determine
 * a unique property name for the duplicated node in case of duplicating
 * and object property
 */
export declare function duplicate(json: unknown, paths: JSONPath[]): JSONPatchDocument;
/**
 * Create a JSONPatch for an extract action.
 */
export declare function extract(json: unknown, selection: JSONSelection): JSONPatchDocument;
export declare function insert(json: unknown, selection: JSONSelection | null, clipboardText: string, parser: JSONParser): JSONPatchDocument;
export declare function moveInsideParent(json: unknown, selection: JSONSelection | null, dragInsideAction: DragInsideAction): JSONPatchDocument;
export declare function createNewValue(json: unknown | undefined, selection: JSONSelection | null, valueType: 'object' | 'array' | 'structure' | 'value'): unknown;
/**
 * Create a JSONPatch for a remove operation
 */
export declare function remove(path: JSONPath): JSONPatchDocument;
/**
 * Create a JSONPatch for a multiple remove operation
 */
export declare function removeAll(paths: JSONPath[]): JSONPatchDocument;
export declare function clipboardToValues(clipboardText: string, parser: JSONParser): ClipboardValues;
export declare function createRemoveOperations(json: unknown, selection: JSONSelection): {
    newSelection: JSONSelection | null;
    operations: JSONPatchDocument;
};
export declare function revertJSONPatchWithMoveOperations(json: unknown, operations: JSONPatchDocument): JSONPatchDocument;
/**
 * Add operations to create parent objects when missing before replacing a nested value
 */
export declare function createNestedValueOperations(operations: JSONPatchOperation[], json: unknown): (JSONPatchAdd | import("immutable-json-patch").JSONPatchRemove | import("immutable-json-patch").JSONPatchReplace | JSONPatchCopy | import("immutable-json-patch").JSONPatchMove | import("immutable-json-patch").JSONPatchTest)[];
