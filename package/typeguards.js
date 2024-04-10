import { isObject } from './utils/typeUtils.js';
export function isMenuSpace(item) {
    // checking the .space property is for backward compatibility
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return item ? item['type'] === 'space' || item['space'] === true : false;
}
export function isMenuSeparator(item) {
    // checking the .separator property is for backward compatibility
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return item ? item['type'] === 'separator' || item['separator'] === true : false;
}
export function isMenuLabel(item) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return item ? item['type'] === 'label' && typeof item['text'] === 'string' : false;
}
export function isMenuButton(item) {
    // for backward compatibility, we only check .onClick here and not item['type'] === 'button'
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return item ? typeof item['onClick'] === 'function' : false;
}
export function isMenuDropDownButton(item) {
    return item
        ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            item['type'] === 'dropdown-button' &&
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                isMenuButton(item['main']) &&
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                Array.isArray(item['items'])
        : false;
}
export function isContextMenuRow(item) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return item ? item['type'] === 'row' && Array.isArray(item['items']) : false;
}
export function isContextMenuColumn(item) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return item ? item['type'] === 'column' && Array.isArray(item['items']) : false;
}
export function isContentParseError(contentErrors) {
    return isObject(contentErrors) && isObject(contentErrors['parseError']);
}
export function isContentValidationErrors(contentErrors) {
    return isObject(contentErrors) && Array.isArray(contentErrors['validationErrors']);
}
export function isValidationError(value) {
    return (isObject(value) &&
        Array.isArray(value.path) &&
        typeof value.message === 'string' &&
        'severity' in value);
}
export function isNestedValidationError(value) {
    return isObject(value) && isValidationError(value) && typeof value.isChildError === 'boolean';
}
export function isSvelteComponentRenderer(value) {
    return isObject(value) && 'component' in value && isObject(value.props);
}
export function isSvelteActionRenderer(value) {
    return isObject(value) && typeof value.action === 'function' && isObject(value.props);
}
