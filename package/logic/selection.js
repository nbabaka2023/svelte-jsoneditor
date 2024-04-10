import { getIn, isJSONArray, isJSONObject, isJSONPatchCopy, isJSONPatchMove, parsePath } from 'immutable-json-patch';
import { first, initial, isEmpty, isEqual, last } from 'lodash-es';
import { isObjectOrArray } from '../utils/typeUtils.js';
import { collapsePath, getNextVisiblePath, getPreviousVisiblePath, getVisibleCaretPositions, getVisiblePaths } from './documentState.js';
import { CaretType, SelectionType } from '../types.js';
import { int } from '../utils/numberUtils.js';
export function isAfterSelection(selection) {
    return (selection && selection.type === SelectionType.after) || false;
}
export function isInsideSelection(selection) {
    return (selection && selection.type === SelectionType.inside) || false;
}
export function isKeySelection(selection) {
    return (selection && selection.type === SelectionType.key) || false;
}
export function isValueSelection(selection) {
    return (selection && selection.type === SelectionType.value) || false;
}
export function isMultiSelection(selection) {
    return (selection && selection.type === SelectionType.multi) || false;
}
export function isMultiSelectionWithOneItem(selection) {
    return isMultiSelection(selection) && isEqual(selection.focusPath, selection.anchorPath);
}
export function isJSONSelection(selection) {
    return (isMultiSelection(selection) ||
        isAfterSelection(selection) ||
        isInsideSelection(selection) ||
        isKeySelection(selection) ||
        isValueSelection(selection));
}
export function isTextSelection(selection) {
    return (selection && selection.type === SelectionType.text) || false;
}
/**
 * Expand a selection start and end into an array containing all paths
 * between (and including) start and end
 */
export function getSelectionPaths(json, selection) {
    const paths = [];
    iterateOverSelection(json, selection, (path) => {
        paths.push(path);
    });
    return paths;
}
/**
 * Expand a selection start and end into an array containing all paths
 * between (and including) start and end.
 *
 * The function iterates always from start to end, independent of the order
 * of focusPath and anchorPath.
 *
 * When the callback returns something other than undefined, the iteration is
 * canceled and the value returned by the callback is returned by iterateOverSelection.
 */
export function iterateOverSelection(json, selection, callback) {
    if (!selection) {
        return undefined;
    }
    const anchorPath = getAnchorPath(selection);
    const focusPath = getFocusPath(selection);
    if (isEqual(anchorPath, focusPath)) {
        // just a single node
        return callback(anchorPath);
    }
    else {
        // multiple nodes
        if (json === undefined) {
            return undefined;
        }
        const sharedPath = findSharedPath(anchorPath, focusPath);
        if (anchorPath.length === sharedPath.length || focusPath.length === sharedPath.length) {
            // a parent and a child, like ['arr', 1] and ['arr']
            return callback(sharedPath);
        }
        const selection = createMultiSelection(anchorPath, focusPath);
        const startPath = getStartPath(json, selection);
        const endPath = getEndPath(json, selection);
        const startIndex = getChildIndex(json, selection, startPath);
        const endIndex = getChildIndex(json, selection, endPath);
        if (startIndex === -1 || endIndex === -1) {
            return undefined;
        }
        const value = getIn(json, sharedPath);
        if (isJSONObject(value)) {
            const keys = Object.keys(value);
            for (let i = startIndex; i <= endIndex; i++) {
                const value = callback(sharedPath.concat(keys[i]));
                if (value !== undefined) {
                    return value;
                }
            }
            return undefined;
        }
        if (isJSONArray(value)) {
            for (let i = startIndex; i <= endIndex; i++) {
                const value = callback(sharedPath.concat(String(i)));
                if (value !== undefined) {
                    return value;
                }
            }
            return undefined;
        }
    }
    throw new Error('Failed to create selection');
}
export function getParentPath(selection) {
    if (isInsideSelection(selection)) {
        return selection.path;
    }
    else {
        return initial(getFocusPath(selection));
    }
}
export function getStartPath(json, selection) {
    if (!isMultiSelection(selection)) {
        return selection.path;
    }
    const anchorIndex = getChildIndex(json, selection, selection.anchorPath);
    const focusIndex = getChildIndex(json, selection, selection.focusPath);
    return focusIndex < anchorIndex ? selection.focusPath : selection.anchorPath;
}
export function getEndPath(json, selection) {
    if (!isMultiSelection(selection)) {
        return selection.path;
    }
    const anchorIndex = getChildIndex(json, selection, selection.anchorPath);
    const focusIndex = getChildIndex(json, selection, selection.focusPath);
    return focusIndex > anchorIndex ? selection.focusPath : selection.anchorPath;
}
// TODO: write unit test
export function isSelectionInsidePath(selection, path) {
    return (pathStartsWith(getFocusPath(selection), path) &&
        (getFocusPath(selection).length > path.length || isInsideSelection(selection)));
}
export function getSelectionUp(json, documentState, keepAnchorPath = false) {
    const selection = documentState.selection;
    if (!selection) {
        return null;
    }
    const focusPath = keepAnchorPath ? getFocusPath(selection) : getStartPath(json, selection);
    const previousPath = getPreviousVisiblePath(json, documentState, focusPath);
    if (keepAnchorPath) {
        // create a multi-selection with multiple nodes
        if (isInsideSelection(selection) || isAfterSelection(selection)) {
            return previousPath !== null ? createMultiSelection(focusPath, focusPath) : null;
        }
        return previousPath !== null
            ? createMultiSelection(getAnchorPath(selection), previousPath)
            : null;
    }
    if (isAfterSelection(selection)) {
        // select the node itself, not the previous node,
        // FIXME: when after an expanded object/array, should go to the last item inside the object/array
        return createValueSelection(focusPath, false);
    }
    if (isInsideSelection(selection)) {
        // select the node itself, not the previous node,
        return createValueSelection(focusPath, false);
    }
    if (isKeySelection(selection)) {
        if (previousPath == null || previousPath.length === 0) {
            return null;
        }
        const parentPath = initial(previousPath);
        const parent = getIn(json, parentPath);
        if (Array.isArray(parent) || isEmpty(previousPath)) {
            // switch to value selection: array has no keys, and root object also not
            return createValueSelection(previousPath, false);
        }
        else {
            return createKeySelection(previousPath, false);
        }
    }
    if (isValueSelection(selection)) {
        return previousPath !== null ? createValueSelection(previousPath, false) : null;
    }
    if (previousPath !== null) {
        return createValueSelection(previousPath, false);
    }
    return null;
}
export function getSelectionDown(json, documentState, keepAnchorPath = false) {
    const selection = documentState.selection;
    if (!selection) {
        return null;
    }
    const focusPath = keepAnchorPath ? getFocusPath(selection) : getEndPath(json, selection);
    // if the focusPath is an Array or object, we must not step into it but
    // over it, we pass state with this array/object collapsed
    const collapsedState = isObjectOrArray(getIn(json, focusPath))
        ? collapsePath(documentState, focusPath)
        : documentState;
    const nextPath = getNextVisiblePath(json, documentState, focusPath);
    const nextPathAfter = getNextVisiblePath(json, collapsedState, focusPath);
    if (keepAnchorPath) {
        // create a multi-selection with multiple nodes
        if (isInsideSelection(selection)) {
            return nextPath !== null ? createMultiSelection(nextPath, nextPath) : null;
        }
        if (isAfterSelection(selection)) {
            return nextPathAfter !== null ? createMultiSelection(nextPathAfter, nextPathAfter) : null;
        }
        return nextPathAfter !== null
            ? createMultiSelection(getAnchorPath(selection), nextPathAfter)
            : null;
    }
    if (isAfterSelection(selection)) {
        return nextPathAfter !== null ? createValueSelection(nextPathAfter, false) : null;
    }
    if (isInsideSelection(selection)) {
        return nextPath !== null ? createValueSelection(nextPath, false) : null;
    }
    if (isValueSelection(selection)) {
        return nextPath !== null ? createValueSelection(nextPath, false) : null;
    }
    if (isKeySelection(selection)) {
        if (nextPath === null || nextPath.length === 0) {
            return null;
        }
        const parentPath = initial(nextPath); // not nextPathAfter!
        const parent = getIn(json, parentPath);
        if (Array.isArray(parent)) {
            // switch to value selection: array has no keys
            return createValueSelection(nextPath, false);
        }
        else {
            return createKeySelection(nextPath, false);
        }
    }
    if (isMultiSelection(selection)) {
        return nextPathAfter !== null
            ? createValueSelection(nextPathAfter, false)
            : nextPath !== null
                ? createValueSelection(nextPath, false)
                : null;
    }
    return null;
}
/**
 * Get the next selection for a value inside the current object/array
 * If there is no next value, select AFTER.
 * Only applicable for ValueSelection
 */
export function getSelectionNextInside(json, documentState, path) {
    // TODO: write unit tests for getSelectionNextInside
    const parentPath = initial(path);
    const childPath = [last(path)];
    const parent = getIn(json, parentPath);
    const nextPathInside = parent ? getNextVisiblePath(parent, documentState, childPath) : undefined;
    if (nextPathInside) {
        return createValueSelection(parentPath.concat(nextPathInside), false);
    }
    else {
        return createAfterSelection(path);
    }
}
/**
 * Find the caret position and its siblings for a given selection
 */
// TODO: unit test
export function findCaretAndSiblings(json, documentState, includeInside) {
    const selection = documentState.selection;
    if (!selection) {
        return { caret: null, previous: null, next: null };
    }
    const visibleCaretPositions = getVisibleCaretPositions(json, documentState, includeInside);
    const index = visibleCaretPositions.findIndex((caret) => {
        return (isEqual(caret.path, getFocusPath(selection)) && String(caret.type) === String(selection.type));
    });
    return {
        caret: index !== -1 ? visibleCaretPositions[index] : null,
        previous: index !== -1 && index > 0 ? visibleCaretPositions[index - 1] : null,
        next: index !== -1 && index < visibleCaretPositions.length - 1
            ? visibleCaretPositions[index + 1]
            : null
    };
}
export function getSelectionLeft(json, documentState, keepAnchorPath = false, includeInside = true) {
    const selection = documentState.selection;
    if (!selection) {
        return null;
    }
    const { caret, previous } = findCaretAndSiblings(json, documentState, includeInside);
    if (keepAnchorPath) {
        if (!isMultiSelection(selection)) {
            return createMultiSelection(selection.path, selection.path);
        }
        return null;
    }
    if (caret && previous) {
        return fromCaretPosition(previous);
    }
    const parentPath = initial(getFocusPath(selection));
    const parent = getIn(json, parentPath);
    if (isValueSelection(selection) && Array.isArray(parent)) {
        return createMultiSelection(selection.path, selection.path);
    }
    if (isMultiSelection(selection) && !Array.isArray(parent)) {
        return createKeySelection(selection.focusPath, false);
    }
    return null;
}
export function getSelectionRight(json, documentState, keepAnchorPath = false, includeInside = true) {
    const selection = documentState.selection;
    if (!selection) {
        return null;
    }
    const { caret, next } = findCaretAndSiblings(json, documentState, includeInside);
    if (keepAnchorPath) {
        if (!isMultiSelection(selection)) {
            return createMultiSelection(selection.path, selection.path);
        }
        return null;
    }
    if (caret && next) {
        return fromCaretPosition(next);
    }
    if (isMultiSelection(selection)) {
        return createValueSelection(selection.focusPath, false);
    }
    return null;
}
/**
 * Get a proper initial selection based on what is visible
 */
export function getInitialSelection(json, documentState) {
    const visiblePaths = getVisiblePaths(json, documentState);
    // find the first, deepest nested entry (normally a value, not an Object/Array)
    let index = 0;
    while (index < visiblePaths.length - 1 &&
        visiblePaths[index + 1].length > visiblePaths[index].length) {
        index++;
    }
    const path = visiblePaths[index];
    return path === undefined || path.length === 0 || Array.isArray(getIn(json, initial(path)))
        ? createValueSelection(path, false) // Array items and root object/array do not have a key, so select value in that case
        : createKeySelection(path, false);
}
export function createSelectionFromOperations(json, operations) {
    if (operations.length === 1) {
        const operation = first(operations);
        if (operation.op === 'replace') {
            // a replaced value
            const path = parsePath(json, operation.path);
            return createValueSelection(path, false);
        }
    }
    if (!isEmpty(operations) && operations.every((operation) => operation.op === 'move')) {
        const firstOp = first(operations);
        const otherOps = operations.slice(1);
        if ((isJSONPatchCopy(firstOp) || isJSONPatchMove(firstOp)) &&
            firstOp.from !== firstOp.path &&
            otherOps.every((op) => (isJSONPatchCopy(op) || isJSONPatchMove(op)) && op.from === op.path)) {
            // a renamed key
            const path = parsePath(json, firstOp.path);
            return createKeySelection(path, false);
        }
    }
    const paths = operations
        .filter((operation) => {
        return (operation.op !== 'test' &&
            operation.op !== 'remove' &&
            (operation.op !== 'move' || operation.from !== operation.path) &&
            typeof operation.path === 'string');
    })
        .map((operation) => parsePath(json, operation.path));
    if (isEmpty(paths)) {
        return null;
    }
    // TODO: make this function robust against operations which do not have consecutive paths or have wrongly ordered paths
    return {
        type: SelectionType.multi,
        anchorPath: first(paths),
        focusPath: last(paths)
    };
}
/**
 * Find the common path of two paths.
 * For example findCommonRoot(['arr', '1', 'name'], ['arr', '1', 'address', 'contact']) returns ['arr', '1']
 */
// TODO: write unit tests for findSharedPath
export function findSharedPath(path1, path2) {
    let i = 0;
    while (i < path1.length && i < path2.length && path1[i] === path2[i]) {
        i++;
    }
    return path1.slice(0, i);
}
export function singleItemSelected(selection) {
    return (isKeySelection(selection) ||
        isValueSelection(selection) ||
        isMultiSelectionWithOneItem(selection));
}
export function findRootPath(json, selection) {
    return singleItemSelected(selection) && isObjectOrArray(getIn(json, getFocusPath(selection)))
        ? getFocusPath(selection)
        : initial(getFocusPath(selection)); // the parent path of the paths
}
// TODO: unit test
export function pathStartsWith(path, parentPath) {
    if (path.length < parentPath.length) {
        return false;
    }
    for (let i = 0; i < parentPath.length; i++) {
        if (path[i] !== parentPath[i]) {
            return false;
        }
    }
    return true;
}
// TODO: write unit tests
export function removeEditModeFromSelection(documentState) {
    const selection = documentState.selection;
    if ((isKeySelection(selection) || isValueSelection(selection)) && selection.edit) {
        return {
            ...documentState,
            selection: {
                ...selection,
                edit: false
            }
        };
    }
    return documentState;
}
export function createKeySelection(path, edit) {
    return {
        type: SelectionType.key,
        path,
        edit
    };
}
export function createValueSelection(path, edit) {
    return {
        type: SelectionType.value,
        path,
        edit
    };
}
export function createInsideSelection(path) {
    return {
        type: SelectionType.inside,
        path
    };
}
export function createAfterSelection(path) {
    return {
        type: SelectionType.after,
        path
    };
}
export function createMultiSelection(anchorPath, focusPath) {
    // normalize the paths to both be a child of a shared parent
    const sharedPath = findSharedPath(anchorPath, focusPath);
    const isParent = anchorPath.length > sharedPath.length && focusPath.length > sharedPath.length;
    return {
        type: SelectionType.multi,
        anchorPath: isParent ? sharedPath.concat(anchorPath[sharedPath.length]) : sharedPath,
        focusPath: isParent ? sharedPath.concat(focusPath[sharedPath.length]) : sharedPath
    };
}
/**
 * Turn selected contents into plain text partial JSON, usable for copying to
 * clipboard for example.
 */
export function selectionToPartialJson(json, selection, indentation, parser) {
    if (isKeySelection(selection)) {
        return String(last(selection.path));
    }
    if (isValueSelection(selection)) {
        const value = getIn(json, selection.path);
        return typeof value === 'string' ? value : parser.stringify(value, null, indentation) ?? null; // TODO: customizable indentation?
    }
    if (isMultiSelection(selection)) {
        if (isEmpty(selection.focusPath)) {
            // root object -> does not have a parent key/index
            return parser.stringify(json, null, indentation) ?? null;
        }
        const parentPath = getParentPath(selection);
        const parent = getIn(json, parentPath);
        if (Array.isArray(parent)) {
            if (isMultiSelectionWithOneItem(selection)) {
                // do not suffix a single selected array item with a comma
                const item = getIn(json, selection.focusPath);
                return parser.stringify(item, null, indentation) ?? null;
            }
            else {
                return getSelectionPaths(json, selection)
                    .map((path) => {
                    const item = getIn(json, path);
                    return `${parser.stringify(item, null, indentation)},`;
                })
                    .join('\n');
            }
        }
        else {
            // parent is Object
            return getSelectionPaths(json, selection)
                .map((path) => {
                const key = last(path);
                const value = getIn(json, path);
                return `${parser.stringify(key)}: ${parser.stringify(value, null, indentation)},`;
            })
                .join('\n');
        }
    }
    return null;
}
export function isEditingSelection(selection) {
    return (isKeySelection(selection) || isValueSelection(selection)) && selection.edit === true;
}
export function updateSelectionInDocumentState(documentState, selection, replaceIfUndefined = true) {
    if (!selection && !replaceIfUndefined) {
        return documentState;
    }
    return {
        ...documentState,
        selection
    };
}
/**
 * Create a selection which selects the root of the document
 */
// TODO: write unit tests
export function selectAll() {
    return createValueSelection([], false);
}
// TODO: write unit tests
export function hasSelectionContents(selection) {
    return isKeySelection(selection) || isValueSelection(selection) || isMultiSelection(selection);
}
/**
 * Test whether the current selection can be converted.
 * That is the case when the selection is a key/value, or a multi selection with only one path
 */
export function canConvert(selection) {
    return (isKeySelection(selection) ||
        isValueSelection(selection) ||
        isMultiSelectionWithOneItem(selection));
}
// TODO: unit test
export function fromCaretPosition(caretPosition) {
    switch (caretPosition.type) {
        case CaretType.key:
            return createKeySelection(caretPosition.path, false);
        case CaretType.value:
            return createValueSelection(caretPosition.path, false);
        case CaretType.after:
            return createAfterSelection(caretPosition.path);
        case CaretType.inside:
            return createInsideSelection(caretPosition.path);
    }
}
// TODO: unit test
export function fromSelectionType(json, selectionType, path) {
    switch (selectionType) {
        case SelectionType.key:
            return createKeySelection(path, false);
        case SelectionType.value:
            return createValueSelection(path, false);
        case SelectionType.after:
            return createAfterSelection(path);
        case SelectionType.inside:
            return createInsideSelection(path);
        case SelectionType.multi:
        case SelectionType.text: // type `text` is not applicable, but we need to handle all types
            return createMultiSelection(path, path);
    }
}
export function selectionIfOverlapping(json, selection, path) {
    if (!selection) {
        return null;
    }
    if (pathInSelection(json, selection, path)) {
        return selection;
    }
    const sharedPath = isMultiSelection(selection) ? initial(selection.focusPath) : selection.path;
    if (pathStartsWith(sharedPath, path)) {
        return selection;
    }
    return null;
}
export function pathInSelection(json, selection, path) {
    if (json === undefined || !selection) {
        return false;
    }
    if (isKeySelection(selection) || isInsideSelection(selection) || isAfterSelection(selection)) {
        return isEqual(selection.path, path);
    }
    if (isValueSelection(selection)) {
        return pathStartsWith(path, selection.path);
    }
    if (isMultiSelection(selection)) {
        const startPath = getStartPath(json, selection);
        const endPath = getEndPath(json, selection);
        const parentPath = initial(selection.focusPath);
        if (!pathStartsWith(path, parentPath) || path.length <= parentPath.length) {
            return false;
        }
        const startIndex = getChildIndex(json, selection, startPath);
        const endIndex = getChildIndex(json, selection, endPath);
        const pathIndex = getChildIndex(json, selection, path);
        return pathIndex !== -1 && pathIndex >= startIndex && pathIndex <= endIndex;
    }
    return false;
}
function getChildIndex(json, selection, path) {
    const parentPath = initial(selection.focusPath);
    if (!pathStartsWith(path, parentPath) || path.length <= parentPath.length) {
        return -1;
    }
    const key = path[parentPath.length];
    const parent = getIn(json, parentPath);
    if (isJSONObject(parent)) {
        const keys = Object.keys(parent);
        return keys.indexOf(key);
    }
    if (isJSONArray(parent)) {
        const index = int(key);
        if (index < parent.length) {
            return index;
        }
    }
    return -1;
}
// TODO: write some unit tests
export function getFocusPath(selection) {
    return isMultiSelection(selection) ? selection.focusPath : selection.path;
}
// TODO: write some unit tests
export function getAnchorPath(selection) {
    return isMultiSelection(selection) ? selection.anchorPath : selection.path;
}
