export interface KeyComboEvent {
    ctrlKey?: boolean;
    metaKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    key: string;
}
/**
 * Get the active key combination from a keyboard event.
 * For example returns "Ctrl+Shift+ArrowUp" or "Ctrl+A"
 *
 * Returns the same output on both Windows and Mac:
 * meta keys "Ctrl" ("Command" on Mac), and "Alt" ("Alt" or "Option" on Mac)
 * So pressing "Command" and "A"on Mac will return "Ctrl+A"
 */
export declare function keyComboFromEvent(event: KeyComboEvent, separator?: string): string;
