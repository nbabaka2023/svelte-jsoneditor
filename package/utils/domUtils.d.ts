import type { ValueNormalization } from '../types.js';
import { SelectionType } from '../types.js';
import type { JSONPath } from 'immutable-json-patch';
/**
 * Create serialization functions to escape and stringify text,
 * and the other way around: to parse and unescape text.
 */
export declare function createNormalizationFunctions({ escapeControlCharacters, escapeUnicodeCharacters }: {
    escapeControlCharacters: boolean;
    escapeUnicodeCharacters: boolean;
}): ValueNormalization;
/**
 * Source:  https://stackoverflow.com/questions/12271547/shouldnt-json-stringify-escape-unicode-characters
 */
export declare function jsonEscapeUnicode(value: string): string;
export declare function jsonUnescapeUnicode(value: string): string;
export declare function jsonEscapeControl(value: string): string;
export declare function jsonUnescapeControl(value: string): string;
export declare function addNewLineSuffix(value: unknown): string;
/**
 * Remove a newline suffix from text returned by element.innerText, it adds
 * one return too much.
 */
export declare function removeNewLineSuffix(text: string): string;
export declare function removeReturnsAndSurroundingWhitespace(text: string): string;
export declare function isChildOfNodeName(element: Element, nodeName: string): boolean;
export declare function isChildOfAttribute(element: Element, name: string, value: string): boolean;
export declare function isContentEditableDiv(element: HTMLElement): boolean;
export declare function isTextInput(element: HTMLInputElement): boolean;
/**
 * Test if the element or one of its parents has a certain predicate
 * Can be use for example to check whether the element or it's parent has
 * a specific attribute or nodeName.
 */
export declare function isChildOf(element: Element, predicate: (element: Element) => boolean): boolean;
/**
 * Test if the element or one of its parents has a certain predicate
 * Can be use for example to check whether the element or it's parent has
 * a specific attribute or nodeName.
 * @param {HTMLElement} element
 * @param {function (element: HTMLElement) : boolean} predicate
 * @returns {HTMLElement | undefined}
 */
export declare function findParent(element: Element, predicate: (element: Element) => boolean): Element | undefined;
/**
 * Set the cursor to the end of a content editable div
 * Source: https://stackoverflow.com/questions/13513329/set-cursor-to-the-end-of-contenteditable-div
 * @param {HTMLElement} element
 */
export declare function setCursorToEnd(element: HTMLElement): void;
/**
 * Insert (append or replace) the text contents of the current active element
 */
export declare function insertActiveElementContents(container: HTMLElement, text: string, replaceContents: boolean, onActiveElement?: (activeElement: HTMLElement) => void): void;
/**
 * Gets a DOM element's Window.  This is normally just the global `window`
 * variable, but if we opened a child window, it may be different.
 */
export declare function getWindow(element: Element): Window | null;
export declare function activeElementIsChildOf(element: Element): boolean;
/**
 * Traverse over the parents of the element until a node is found with the
 * searched for node name. If the element itself contains the nodeName, the
 * element itself will be returned
 */
export declare function findParentWithNodeName(element: Element, nodeName: string): Element | undefined;
export declare function getSelectionTypeFromTarget(target: Element): SelectionType;
/**
 * Encode a path into a string that can be used as attribute in HTML
 */
export declare function encodeDataPath(path: JSONPath): string;
/**
 * Decode a path that was stringified for use as an HTML attribute
 */
export declare function decodeDataPath(pathStr: string): JSONPath;
/**
 * Find the data path of the given element. Traverses the parent nodes until find
 */
export declare function getDataPathFromTarget(target: Element): JSONPath | null;
/**
 * Find the nearest element in a given context menu with buttons or inputs
 */
export declare function findNearestElement<T extends Element>({ allElements, currentElement, direction, hasPrio, margin }: {
    allElements: T[];
    currentElement: T;
    direction: 'Up' | 'Down' | 'Left' | 'Right';
    margin?: number;
    hasPrio?: (element: T) => boolean;
}): T | undefined;
export interface EditableDivElement extends HTMLDivElement {
    refresh: () => void;
    cancel: () => void;
}
export declare function isEditableDivRef(element: Element | null): element is EditableDivElement;
