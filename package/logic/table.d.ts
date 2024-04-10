import type { JSONPatchOperation, JSONPath } from 'immutable-json-patch';
import type { DocumentState, JSONSelection, SortedColumn, TableCellIndex, ValidationError } from '../types.js';
import type { Dictionary } from 'lodash';
export declare function getColumns(array: Array<unknown>, flatten: boolean, maxSampleCount?: number): JSONPath[];
export declare function maintainColumnOrder(newColumns: JSONPath[], previousColumns: JSONPath[]): JSONPath[];
export declare function getShallowKeys(value: unknown): JSONPath[];
export declare function getRecursiveKeys(value: unknown): JSONPath[];
export interface VisibleSection {
    startIndex: number;
    endIndex: number;
    startHeight: number;
    visibleHeight: number;
    endHeight: number;
    averageItemHeight: number;
    visibleItems: Array<unknown>;
}
export declare function calculateVisibleSection(scrollTop: number, viewPortHeight: number, json: unknown | undefined, itemHeights: Record<number, number>, defaultItemHeight: number, searchBoxOffset: number, margin?: number): VisibleSection;
export declare function calculateVisibleSectionApprox(scrollTop: number, viewPortHeight: number, json: unknown | undefined, defaultItemHeight: number): VisibleSection;
export declare function calculateAbsolutePosition(path: JSONPath, columns: JSONPath[], itemHeights: Record<number, number>, defaultItemHeight: number): number;
export declare function selectPreviousRow(columns: JSONPath[], selection: JSONSelection): JSONSelection;
export declare function selectNextRow(json: unknown, columns: JSONPath[], selection: JSONSelection): JSONSelection;
export declare function selectPreviousColumn(columns: JSONPath[], selection: JSONSelection): JSONSelection;
export declare function selectNextColumn(columns: JSONPath[], selection: JSONSelection): JSONSelection;
export declare function toTableCellPosition(path: JSONPath, columns: JSONPath[]): TableCellIndex;
export declare function fromTableCellPosition(position: TableCellIndex, columns: JSONPath[]): JSONPath;
export declare function stringifyTableCellPosition(position: TableCellIndex): string;
interface GroupedValidationErrorsByRow {
    row: ValidationError[];
    columns: Dictionary<ValidationError[]>;
}
export interface GroupedValidationErrors {
    root: ValidationError[];
    rows: Dictionary<GroupedValidationErrorsByRow>;
}
/**
 * Group validation errors for use in the Table view: per column, and a group for the row as a whole
 */
export declare function groupValidationErrors(validationErrors: ValidationError[], columns: JSONPath[]): GroupedValidationErrors;
export declare function mergeValidationErrors(path: JSONPath, validationErrors: ValidationError[] | undefined): ValidationError | undefined;
/**
 * Clear the sorted column from the documentState when it is affected by the operations
 */
export declare function clearSortedColumnWhenAffectedByOperations(documentState: DocumentState, operations: JSONPatchOperation[], columms: JSONPath[]): DocumentState;
export declare function operationAffectsSortedColumn(sortedColumn: SortedColumn | null, operation: JSONPatchOperation, columns: JSONPath[]): boolean;
/**
 * Find nested arrays inside a JSON object
 */
export declare function findNestedArrays(json: unknown, maxLevel?: number): JSONPath[];
export {};
