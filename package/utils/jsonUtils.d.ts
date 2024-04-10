import type { JSONPath } from 'immutable-json-patch';
import type { Content, JSONContent, JSONParser, ParseError, TextContent, TextLocation } from '../types';
/**
 * Parse the JSON. if this fails, try to repair and parse.
 * Throws an exception when the JSON is invalid and could not be parsed.
 */
export declare function parseAndRepair(jsonText: string, parser: JSONParser): unknown;
/**
 * Parse the JSON and if needed repair it.
 * When not valid, undefined is returned.
 */
export declare function parseAndRepairOrUndefined(partialJson: string, parser: JSONParser): unknown | undefined;
export declare function parsePartialJson(partialJson: string, parse: (text: string) => unknown): unknown;
/**
 * Repair partial JSON
 */
export declare function repairPartialJson(partialJson: string): string;
/**
 * Normalize a parse error message like
 *     "Unexpected token i in JSON at position 4"
 * or
 *     "JSON.parse: expected property name or '}' at line 2 column 3 of the JSON data"
 * and return the line and column numbers in an object
 *
 * Note that the returned line and column number in the object are zero-based,
 * and in the message are one based (human-readable)
 */
export declare function normalizeJsonParseError(jsonText: string, parseErrorMessage: string): ParseError;
/**
 * Calculate the position in the text based on a line and column number
 * @param text
 * @param line     Zero-based line number
 * @param column   Zero-based column number
 */
export declare function calculatePosition(text: string, line: number, column: number): number | null;
export declare function countCharacterOccurrences(text: string, character: string, start?: number, end?: number): number;
/**
 * Find the text location of a JSON path
 */
export declare function findTextLocation(text: string, path: JSONPath): TextLocation;
/**
 * Convert a JSON object, array, or value to another type
 * If it cannot be converted, an error is thrown
 */
export declare function convertValue(value: unknown, type: 'value' | 'object' | 'array', parser: JSONParser): unknown;
/**
 * Check whether provided value is valid a content type for JSONEditor
 * Returns a string with validation error message when there is an issue,
 * or null otherwise
 */
export declare function validateContentType(content: unknown): string | null;
/**
 * Check whether a value is Content (TextContent or JSONContent)
 */
export declare function isContent(content: unknown): content is Content;
/**
 * Check whether content contains text (and not JSON)
 */
export declare function isTextContent(content: unknown): content is TextContent;
/**
 * Check whether content contains json
 */
export declare function isJSONContent(content: unknown): content is JSONContent;
/**
 * Convert Content into TextContent if it is JSONContent, else leave it as is
 */
export declare function toTextContent(content: Content, indentation?: number | string | undefined, parser?: JSONParser): TextContent;
/**
 * Convert Content into TextContent if it is JSONContent, else leave it as is
 * @throws {SyntaxError} Will throw a parse error when the text contents does not contain valid JSON
 */
export declare function toJSONContent(content: Content, parser?: JSONParser): JSONContent;
/**
 * Get the contents as Text. If the contents is JSON, the JSON will be parsed.
 */
export declare function getText(content: Content, indentation: number | string, parser: JSONParser): string;
/**
 * Returns true when the (estimated) size of the contents exceeds the
 * provided maxSize.
 * @param content
 * @param maxSize  Maximum content size in bytes
 */
export declare function isLargeContent(content: Content, maxSize: number): boolean;
/**
 * A rough, fast estimation on whether a document is larger than given size
 * when serialized.
 *
 * maxSize is an optional max size in bytes. When reached, size estimation will
 * be cancelled. This is useful when you're only interested in knowing whether
 * the size exceeds a certain maximum size.
 */
export declare function estimateSerializedSize(content: Content, maxSize?: number): number;
/**
 * Check whether the actual functions of parse and stringify are strictly equal.
 * The object holding the functions may be a differing instance.
 */
export declare function isEqualParser(a: JSONParser, b: JSONParser): boolean;
/**
 * Apply a fast and cheap heuristic to determine whether the content needs formatting (i.e. is compact).
 */
export declare function needsFormatting(jsonText: string): boolean;
