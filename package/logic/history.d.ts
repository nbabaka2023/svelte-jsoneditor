/**
 * @typedef {*} HistoryItem
 * @property {Object} undo
 * @property {Object} redo
 */
export interface HistoryOptions {
    maxItems?: number;
    onChange?: (props: {
        canUndo: boolean;
        canRedo: boolean;
        length: number;
    }) => void;
}
export interface HistoryState {
    canUndo: boolean;
    canRedo: boolean;
    length: number;
}
export interface History<T> {
    add: (item: T) => void;
    clear: () => void;
    getState: () => HistoryState;
    undo: () => T | undefined;
    redo: () => T | undefined;
}
export declare function createHistory<T>(options?: HistoryOptions): History<T>;
