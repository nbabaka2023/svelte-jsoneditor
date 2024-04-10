import type { JSONPointerMap } from '../types';
import type { JSONPointer } from 'immutable-json-patch';
export declare function filterMapOrUndefined<T>(map: JSONPointerMap<T> | undefined, filter: (pointer: JSONPointer, value: T) => boolean): JSONPointerMap<T> | undefined;
export declare function filterPointerOrUndefined<T>(map: JSONPointerMap<T> | undefined, pointer: JSONPointer): JSONPointerMap<T> | undefined;
