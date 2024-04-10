import { isEmpty, last } from 'lodash-es';
// singleton stack with callbacks
let callbacks = [];
function handleKeyDown(event) {
    if (event.key === 'Escape') {
        const callback = last(callbacks);
        if (callback) {
            callback();
        }
    }
}
/**
 * The provided callback is invoked when the user presses Escape,
 * but only the callback of the last registered component is invoked.
 *
 * This is useful for example when opening a model on top of another modal:
 * you only want the top modal to close on Escape, and not the second modal.
 */
export function onEscape(element, callback) {
    if (isEmpty(callbacks)) {
        window.addEventListener('keydown', handleKeyDown);
    }
    callbacks.push(callback);
    return {
        destroy: () => {
            callbacks = callbacks.filter((c) => c !== callback);
            if (isEmpty(callbacks)) {
                window.removeEventListener('keydown', handleKeyDown);
            }
        }
    };
}
