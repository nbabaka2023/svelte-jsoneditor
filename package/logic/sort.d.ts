import type { JSONPatchDocument, JSONPatchOperation, JSONPath } from 'immutable-json-patch';
export declare function caseInsensitiveNaturalCompare(a: unknown, b: unknown): number;
/**
 * Sort a JSON object or array
 * @param json           The the JSON containing the (optionally nested)
 *                       object to be sorted
 * @param [rootPath=[]]  Relative path when the array was located
 * @param [itemPath=[]]  Item path by which to sort items in case of an array
 * @param [direction=1]  Pass 1 to sort ascending, -1 to sort descending
 * @return               Returns a JSONPatch document with move operation
 *                       to get the array sorted.
 */
export declare function sortJson(json: unknown, rootPath?: JSONPath, itemPath?: JSONPath, direction?: 1 | -1): JSONPatchDocument;
/**
 * Sort the keys of an object
 * @param json           The the JSON containing the (optionally nested)
 *                       object to be sorted
 * @param [rootPath=[]]  Relative path when the array was located
 * @param [direction=1]  Pass 1 to sort ascending, -1 to sort descending
 * @return               Returns a JSONPatch document with move operation
 *                       to get the array sorted.
 */
export declare function sortObjectKeys(json: unknown, rootPath?: JSONPath, direction?: 1 | -1): JSONPatchDocument;
/**
 * Sort the items of an array
 * @param json               The document containing (optionally nested)
 *                           the array to be sorted.
 * @param [rootPath=[]]      Relative path when the array was located
 * @param [propertyPath=[]]  Nested path to the property on which to sort the contents
 * @param [direction=1]      Pass 1 to sort ascending, -1 to sort descending
 * @return                   Returns a JSONPatch document with move operation
 *                           to get the array sorted.
 */
export declare function sortArray(json: unknown, rootPath?: JSONPath, propertyPath?: JSONPath, direction?: 1 | -1): JSONPatchDocument;
/**
 * Create a list with JSON Patch move operations
 * needed to sort the array contents.
 */
export declare function sortOperationsMove<T>(array: T[], comparator: (a: T, b: T) => number): JSONPatchOperation[];
/**
 * Create an array containing all move operations
 * needed to sort the array contents.
 */
export declare function sortOperationsMoveAdvanced<T>(array: T[], comparator: (a: T, b: T) => number): JSONPatchOperation[];
/**
 * Fast solution to apply many JSON patch move operations inside a single array,
 * like applying all moves needed to sort an array.
 *
 * Throws an error when not all operations are move operation inside the same
 * array.
 */
export declare function fastPatchSort(json: unknown, operations: JSONPatchDocument): unknown;
