// inspiration: https://github.com/andrepolischuk/keycomb
/**
 * Get the active key combination from a keyboard event.
 * For example returns "Ctrl+Shift+ArrowUp" or "Ctrl+A"
 *
 * Returns the same output on both Windows and Mac:
 * meta keys "Ctrl" ("Command" on Mac), and "Alt" ("Alt" or "Option" on Mac)
 * So pressing "Command" and "A"on Mac will return "Ctrl+A"
 */
export function keyComboFromEvent(event, separator = '+') {
    const combi = [];
    if (event.ctrlKey) {
        // Control on Windows
        combi.push('Ctrl');
    }
    if (event.metaKey) {
        // Command on Mac
        combi.push('Ctrl');
    }
    if (event.altKey) {
        // on Mac this is called Option
        combi.push('Alt');
    }
    if (event.shiftKey) {
        combi.push('Shift');
    }
    const keyName = event.key.length === 1 ? event.key.toUpperCase() : event.key;
    if (!(keyName in metaKeys)) {
        // prevent output like 'Ctrl+Ctrl'
        combi.push(keyName);
    }
    return combi.join(separator);
}
const metaKeys = {
    Ctrl: true,
    Command: true,
    Control: true,
    Alt: true,
    Option: true,
    Shift: true
};
