import type { JSONPath } from 'immutable-json-patch';
export declare const singleton: Singleton;
interface Singleton {
    selecting: boolean;
    selectionAnchor: JSONPath | null;
    selectionAnchorType: string | null;
    selectionFocus: JSONPath | null;
    dragging: boolean;
}
export {};
