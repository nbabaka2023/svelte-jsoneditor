type Callback = () => void;
/**
 * The provided callback is invoked when the user presses Escape,
 * but only the callback of the last registered component is invoked.
 *
 * This is useful for example when opening a model on top of another modal:
 * you only want the top modal to close on Escape, and not the second modal.
 */
export declare function onEscape(element: Element | null, callback: Callback): {
    destroy: () => void;
};
export {};
