export interface FocusTrackerProps {
    onMount: (callback: () => void) => void;
    onDestroy: (callback: () => void) => void;
    getWindow: () => Window | null;
    hasFocus: () => boolean;
    onFocus: () => void;
    onBlur: () => void;
}
export declare function createFocusTracker({ onMount, onDestroy, getWindow, hasFocus, onFocus, onBlur }: FocusTrackerProps): void;
