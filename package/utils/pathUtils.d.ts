import type { JSONPath } from 'immutable-json-patch';
import type { PathOption } from '../types.js';
/**
 **
 * Stringify an array with a path like ['items', '3', 'name'] into string like 'items[3].name'
 * Note that we allow all characters in a property name, like "item with spaces[3].name",
 * so this path is not usable as-is in JavaScript.
 */
export declare function stringifyJSONPath(path: JSONPath): string;
/**
 * Parse a JSON path like 'items[3].name' into a path like ['items', '3', 'name']
 */
export declare function parseJSONPath(pathStr: string): JSONPath;
/**
 * Convert a JSONPath into an option for use in a select box
 */
export declare function pathToOption(path: JSONPath): PathOption;
/**
 * Stringify a JSON path into a lodash path like:
 *
 *     ["data", 2, "nested property", "name"]
 *
 * into a lodash path like:
 *
 *     "data[2].nested.name"
 *
 */
export declare function createLodashPropertySelector(path: JSONPath): string;
/**
 * Create a JavaScript property selector
 *
 * Turn a paths like:
 *
 *   ['location', 'latitude']
 *   ['address', 'full name']
 *
 * into a JavaScript selector (string) like:
 *
 *   '?.location?.latitude'
 *   '?.address?.["full name"]'
 */
export declare function createPropertySelector(path: JSONPath): string;
/**
 * Create a memoized function that will memoize the input path, and return
 * the memoized instance of the path when the stringified version is the same.
 */
export declare function createMemoizePath(): (path: JSONPath) => JSONPath;
