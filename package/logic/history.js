import { createDebug } from '../utils/debug.js';
const MAX_HISTORY_ITEMS = 1000;
const debug = createDebug('jsoneditor:History');
export function createHistory(options = {}) {
    const maxItems = options.maxItems || MAX_HISTORY_ITEMS;
    /**
     * items in history are sorted from newest first to oldest last
     */
    let items = [];
    let index = 0;
    function canUndo() {
        return index < items.length;
    }
    function canRedo() {
        return index > 0;
    }
    function getState() {
        return {
            canUndo: canUndo(),
            canRedo: canRedo(),
            length: items.length
        };
    }
    function handleChange() {
        if (options.onChange) {
            options.onChange(getState());
        }
    }
    function add(item) {
        debug('add', item);
        items = [item].concat(items.slice(index)).slice(0, maxItems);
        index = 0;
        handleChange();
    }
    function clear() {
        debug('clear');
        items = [];
        index = 0;
        handleChange();
    }
    function undo() {
        if (canUndo()) {
            const item = items[index];
            index += 1;
            debug('undo', item);
            handleChange();
            return item;
        }
        return undefined;
    }
    function redo() {
        if (canRedo()) {
            index -= 1;
            debug('redo', items[index]);
            handleChange();
            return items[index];
        }
        return undefined;
    }
    return {
        add,
        clear,
        getState,
        undo,
        redo
    };
}
