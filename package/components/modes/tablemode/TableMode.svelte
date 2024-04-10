<svelte:options immutable={true} />

<script>import { Mode, SortDirection, ValidationSeverity } from '../../../types.js';
import TableMenu from './menu/TableMenu.svelte';
import { compileJSONPointer, compileJSONPointerProp, existsIn, getIn, immutableJSONPatch, isJSONArray } from 'immutable-json-patch';
import { isTextContent, normalizeJsonParseError, parseAndRepair, parsePartialJson, repairPartialJson } from '../../../utils/jsonUtils.js';
import { calculateAbsolutePosition, calculateVisibleSection, clearSortedColumnWhenAffectedByOperations, getColumns, groupValidationErrors, maintainColumnOrder, mergeValidationErrors, selectNextColumn, selectNextRow, selectPreviousColumn, selectPreviousRow, toTableCellPosition } from '../../../logic/table.js';
import { isEmpty, isEqual, uniqueId } from 'lodash-es';
import JSONValueComponent from './JSONValue.svelte';
import { activeElementIsChildOf, createNormalizationFunctions, encodeDataPath, findParentWithNodeName, getDataPathFromTarget, getWindow, isEditableDivRef } from '../../../utils/domUtils.js';
import { createDebug } from '../../../utils/debug.js';
import { createDocumentState, documentStatePatch, expandMinimal, expandWithCallback, getEnforceString, setEnforceString } from '../../../logic/documentState.js';
import { isObjectOrArray, isUrl, stringConvert } from '../../../utils/typeUtils.js';
import InlineValue from './tag/InlineValue.svelte';
import { revertJSONPatchWithMoveOperations } from '../../../logic/operations.js';
import { createValueSelection, getAnchorPath, getFocusPath, isEditingSelection, isJSONSelection, isValueSelection, pathInSelection, pathStartsWith, removeEditModeFromSelection } from '../../../logic/selection.js';
import { createHistory } from '../../../logic/history.js';
import ColumnHeader from './ColumnHeader.svelte';
import { sortJson } from '../../../logic/sort.js';
import { keyComboFromEvent } from '../../../utils/keyBindings.js';
import { createFocusTracker } from '../../controls/createFocusTracker.js';
import { getContext, onDestroy, onMount, tick } from 'svelte';
import { jsonrepair } from 'jsonrepair';
import Message from '../../controls/Message.svelte';
import { faCheck, faCode, faWrench } from '@fortawesome/free-solid-svg-icons';
import { measure } from '../../../utils/timeUtils.js';
import memoizeOne from 'memoize-one';
import { validateJSON } from '../../../logic/validation.js';
import ValidationErrorsOverview from '../../controls/ValidationErrorsOverview.svelte';
import { CONTEXT_MENU_HEIGHT, CONTEXT_MENU_WIDTH, SCROLL_DURATION, SEARCH_BOX_HEIGHT, SIMPLE_MODAL_OPTIONS } from '../../../constants.js';
import { noop } from '../../../utils/noop.js';
import { createJump } from '../../../assets/jump.js/src/jump.js';
import ValidationErrorIcon from '../treemode/ValidationErrorIcon.svelte';
import { onCopy, onCut, onDuplicateRow, onInsertAfterRow, onInsertBeforeRow, onInsertCharacter, onPaste, onRemove, onRemoveRow } from '../../../logic/actions.js';
import JSONRepairModal from '../../modals/JSONRepairModal.svelte';
import { resizeObserver } from '../../../actions/resizeObserver.js';
import CopyPasteModal from '../../../components/modals/CopyPasteModal.svelte';
import ContextMenuPointer from '../../../components/controls/contextmenu/ContextMenuPointer.svelte';
import SearchBox from '../../controls/SearchBox.svelte';
import TableModeWelcome from './TableModeWelcome.svelte';
import JSONPreview from '../../controls/JSONPreview.svelte';
import RefreshColumnHeader from './RefreshColumnHeader.svelte';
import createTableContextMenuItems from './contextmenu/createTableContextMenuItems';
import ContextMenu from '../../controls/contextmenu/ContextMenu.svelte';
import { filterValueSearchResults } from '../../../logic/search.js';
import { filterPointerOrUndefined } from '../../../utils/jsonPointer';
const debug = createDebug('jsoneditor:TableMode');
const { open } = getContext('simple-modal');
const { openAbsolutePopup, closeAbsolutePopup } = getContext('absolute-popup');
const jump = createJump();
const sortModalId = uniqueId();
const transformModalId = uniqueId();
const isSSR = typeof window === 'undefined';
debug('isSSR:', isSSR);
export let readOnly;
export let externalContent;
export let externalSelection;
export let mainMenuBar;
export let escapeControlCharacters;
export let escapeUnicodeCharacters;
export let flattenColumns;
export let parser;
export let parseMemoizeOne;
export let validator;
export let validationParser;
export let indentation;
export let onChange;
export let onChangeMode;
export let onSelect;
export let onRenderValue;
export let onRenderMenu;
export let onRenderContextMenu;
export let onFocus;
export let onBlur;
export let onSortModal;
export let onTransformModal;
export let onJSONEditorModal;
let normalization;
$: normalization = createNormalizationFunctions({
    escapeControlCharacters,
    escapeUnicodeCharacters
});
let refJsonEditor;
let refContents;
let refHiddenInput;
createFocusTracker({
    onMount,
    onDestroy,
    getWindow: () => getWindow(refJsonEditor),
    hasFocus: () => (modalOpen && document.hasFocus()) || activeElementIsChildOf(refJsonEditor),
    onFocus: () => {
        hasFocus = true;
        if (onFocus) {
            onFocus();
        }
    },
    onBlur: () => {
        hasFocus = false;
        if (onBlur) {
            onBlur();
        }
    }
});
let json;
let text;
let parseError = undefined;
let pastedJson;
let searchResult;
let showSearch = false;
let showReplace = false;
$: applySearchBoxSpacing(showSearch);
function applySearchBoxSpacing(showSearch) {
    if (!refContents) {
        return;
    }
    const offset = showSearch ? SEARCH_BOX_HEIGHT : -SEARCH_BOX_HEIGHT;
    refContents.scrollTo({
        top: (refContents.scrollTop += offset),
        left: refContents.scrollLeft
    });
}
function handleSearch(result) {
    searchResult = result;
}
async function handleFocusSearch(path) {
    documentState = {
        ...documentState,
        selection: null // navigation path of current selection would be confusing
    };
    await scrollTo(path);
}
function handleCloseSearch() {
    showSearch = false;
    showReplace = false;
    focus();
}
$: applyExternalContent(externalContent);
$: applyExternalSelection(externalSelection);
let maxSampleCount = 10000;
let columns = [];
$: columns = isJSONArray(json)
    ? maintainColumnOrder(getColumns(json, flattenColumns, maxSampleCount), columns)
    : [];
let containsValidArray;
$: containsValidArray = !!(json && !isEmpty(columns));
$: showRefreshButton = Array.isArray(json) && json.length > maxSampleCount;
// modalOpen is true when one of the modals is open.
// This is used to track whether the editor still has focus
let modalOpen = false;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let hasFocus = false;
let itemHeightsCache = {};
let viewPortHeight = 600;
let scrollTop = 0;
let defaultItemHeight = 18; // px
$: visibleSection = calculateVisibleSection(scrollTop, viewPortHeight, json, itemHeightsCache, // warning: itemHeightsCache is mutated and is not responsive itself
defaultItemHeight, showSearch ? SEARCH_BOX_HEIGHT : 0);
$: refreshScrollTop(json);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function refreshScrollTop(_json) {
    // When the contents go from lots of items and scrollable contents to only a few items and
    // no vertical scroll, the actual scrollTop changes to 0 but there is no on:scroll event
    // triggered, so the internal scrollTop variable is not up-to-date.
    // This is a workaround to update the scrollTop by triggering an on:scroll event
    if (refContents) {
        refContents.scrollTo({
            top: refContents.scrollTop,
            left: refContents.scrollLeft
        });
    }
}
function clearSortedColumn() {
    if (documentState.sortedColumn) {
        documentState = {
            ...documentState,
            sortedColumn: null
        };
    }
}
function updateSelection(selection) {
    debug('updateSelection', selection);
    const updatedSelection = typeof selection === 'function' ? selection(documentState.selection) || null : selection;
    if (!isEqual(updatedSelection, documentState.selection)) {
        documentState = {
            ...documentState,
            selection: updatedSelection
        };
        onSelect(updatedSelection);
    }
}
function clearSelectionWhenNotExisting(json) {
    if (!documentState.selection || json === undefined) {
        return;
    }
    if (existsIn(json, getAnchorPath(documentState.selection)) &&
        existsIn(json, getFocusPath(documentState.selection))) {
        return;
    }
    debug('clearing selection: path does not exist anymore', documentState.selection);
    documentState = {
        ...documentState,
        selection: null // TODO: try find the closest cell that still exists (similar to getInitialSelection)
    };
}
let documentState = createDocumentState();
let textIsRepaired = false;
function onSortByHeader(newSortedColumn) {
    if (readOnly) {
        return;
    }
    debug('onSortByHeader', newSortedColumn);
    const rootPath = [];
    const direction = newSortedColumn.sortDirection === SortDirection.desc ? -1 : 1;
    const operations = sortJson(json, rootPath, newSortedColumn.path, direction);
    handlePatch(operations, (_, patchedState) => {
        return {
            state: {
                ...patchedState,
                sortedColumn: newSortedColumn
            }
        };
    });
}
const history = createHistory({
    onChange: (state) => {
        historyState = state;
    }
});
let historyState = history.getState();
let context;
$: context = {
    readOnly,
    parser,
    normalization,
    getJson: () => json,
    getDocumentState: () => documentState,
    findElement,
    findNextInside,
    focus,
    onPatch: handlePatch,
    onSelect: updateSelection,
    onFind: handleFind,
    onPasteJson: handlePasteJson,
    onRenderValue
};
function applyExternalContent(content) {
    const currentContent = { json };
    const isChanged = isTextContent(content)
        ? content.text !== text
        : !isEqual(currentContent.json, content.json);
    debug('update external content', { isChanged });
    if (!isChanged) {
        // no actual change, don't do anything
        return;
    }
    const previousJson = json;
    const previousState = documentState;
    const previousText = text;
    const previousTextIsRepaired = textIsRepaired;
    if (isTextContent(content)) {
        try {
            json = parseMemoizeOne(content.text);
            text = content.text;
            textIsRepaired = false;
            parseError = undefined;
        }
        catch (err) {
            try {
                json = parseMemoizeOne(jsonrepair(content.text));
                text = content.text;
                textIsRepaired = true;
                parseError = undefined;
            }
            catch (repairError) {
                // no valid JSON, will show empty document or invalid json
                json = undefined;
                text = content.text;
                textIsRepaired = false;
                parseError =
                    text !== ''
                        ? normalizeJsonParseError(text, err.message || String(err))
                        : undefined;
            }
        }
    }
    else {
        json = content.json;
        text = undefined;
        textIsRepaired = false;
        parseError = undefined;
    }
    // make sure the selection is valid
    clearSelectionWhenNotExisting(json);
    // reset the sorting order (we don't know...)
    clearSortedColumn();
    addHistoryItem({
        previousJson,
        previousState,
        previousText,
        previousTextIsRepaired
    });
}
function applyExternalSelection(externalSelection) {
    if (!isEqual(documentState.selection, externalSelection)) {
        debug('applyExternalSelection', externalSelection);
        if (isJSONSelection(externalSelection) || externalSelection === null) {
            updateSelection(externalSelection);
        }
    }
}
// TODO: addHistoryItem is a duplicate of addHistoryItem in TreeMode.svelte. Can we extract and reuse this logic?
function addHistoryItem({ previousJson, previousState, previousText, previousTextIsRepaired }) {
    if (previousJson === undefined && previousText === undefined) {
        // initialization -> do not create a history item
        return;
    }
    if (json !== undefined) {
        if (previousJson !== undefined) {
            // regular undo/redo with JSON patch
            history.add({
                undo: {
                    patch: [{ op: 'replace', path: '', value: previousJson }],
                    state: removeEditModeFromSelection(previousState),
                    json: undefined,
                    text: previousText,
                    textIsRepaired: previousTextIsRepaired
                },
                redo: {
                    patch: [{ op: 'replace', path: '', value: json }],
                    state: removeEditModeFromSelection(documentState),
                    json: undefined,
                    text,
                    textIsRepaired
                }
            });
        }
        else {
            history.add({
                undo: {
                    patch: undefined,
                    json: undefined,
                    text: previousText,
                    state: removeEditModeFromSelection(previousState),
                    textIsRepaired: previousTextIsRepaired
                },
                redo: {
                    patch: undefined,
                    json,
                    state: removeEditModeFromSelection(documentState),
                    text,
                    textIsRepaired
                }
            });
        }
    }
    else {
        if (previousJson !== undefined) {
            history.add({
                undo: {
                    patch: undefined,
                    json: previousJson,
                    state: removeEditModeFromSelection(previousState),
                    text: previousText,
                    textIsRepaired: previousTextIsRepaired
                },
                redo: {
                    patch: undefined,
                    json: undefined,
                    text,
                    textIsRepaired,
                    state: removeEditModeFromSelection(documentState)
                }
            });
        }
        else {
            // this cannot happen. Nothing to do, no change
        }
    }
}
let validationErrors = [];
$: updateValidationErrors(json, validator, parser, validationParser);
$: groupedValidationErrors = groupValidationErrors(validationErrors, columns);
// because onChange returns the validation errors and there is also a separate listener,
// we would execute validation twice. Memoizing the last result solves this.
const memoizedValidate = memoizeOne(validateJSON);
function updateValidationErrors(json, validator, parser, validationParser) {
    measure(() => {
        let newValidationErrors;
        try {
            newValidationErrors = memoizedValidate(json, validator, parser, validationParser);
        }
        catch (err) {
            newValidationErrors = [
                {
                    path: [],
                    message: 'Failed to validate: ' + err.message,
                    severity: ValidationSeverity.warning
                }
            ];
        }
        if (!isEqual(newValidationErrors, validationErrors)) {
            debug('validationErrors changed:', newValidationErrors);
            validationErrors = newValidationErrors;
        }
    }, (duration) => debug(`validationErrors updated in ${duration} ms`));
}
export function validate() {
    debug('validate');
    if (parseError) {
        return {
            parseError,
            isRepairable: false // not applicable, if repairable, we will not have a parseError
        };
    }
    // make sure the validation results are up-to-date
    // normally, they are only updated on the next tick after the json is changed
    updateValidationErrors(json, validator, parser, validationParser);
    return !isEmpty(validationErrors) ? { validationErrors } : null;
}
export function patch(operations, afterPatch) {
    debug('patch', operations, afterPatch);
    if (json === undefined) {
        throw new Error('Cannot apply patch: no JSON');
    }
    const previousJson = json;
    const previousState = documentState;
    const previousTextIsRepaired = textIsRepaired;
    // execute the patch operations
    const undo = revertJSONPatchWithMoveOperations(json, operations);
    const patched = documentStatePatch(json, documentState, operations);
    // Clear the sorted column when needed. We need to do this before `afterPatch`,
    // else we clear any changed made in the callback. It is a bit odd that
    // afterPatch does not receive the actual previousDocumentState. Better ideas?
    const patchedJson = patched.json;
    const patchedDocumentState = clearSortedColumnWhenAffectedByOperations(documentState, operations, columns);
    const callback = typeof afterPatch === 'function' ? afterPatch(patchedJson, patchedDocumentState) : undefined;
    json = callback && callback.json !== undefined ? callback.json : patchedJson;
    const newState = callback && callback.state !== undefined ? callback.state : patchedDocumentState;
    documentState = newState;
    text = undefined;
    textIsRepaired = false;
    pastedJson = undefined;
    parseError = undefined;
    history.add({
        undo: {
            patch: undo,
            json: undefined,
            text: undefined,
            state: removeEditModeFromSelection(previousState),
            textIsRepaired: previousTextIsRepaired
        },
        redo: {
            patch: operations,
            json: undefined,
            state: removeEditModeFromSelection(newState),
            text: undefined,
            textIsRepaired
        }
    });
    return {
        json,
        previousJson,
        undo,
        redo: operations
    };
}
function handlePatch(operations, afterPatch) {
    debug('handlePatch', operations, afterPatch);
    const previousContent = { json, text };
    const patchResult = patch(operations, afterPatch);
    emitOnChange(previousContent, patchResult);
    return patchResult;
}
function emitOnChange(previousContent, patchResult) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (previousContent.json === undefined && previousContent?.text === undefined) {
        // initialization -> do not fire an onChange event
        return;
    }
    // make sure we cannot send an invalid contents like having both
    // json and text defined, or having none defined
    if (onChange) {
        if (text !== undefined) {
            const content = { text, json: undefined };
            onChange(content, previousContent, {
                contentErrors: validate(),
                patchResult
            });
        }
        else if (json !== undefined) {
            const content = { text: undefined, json };
            onChange(content, previousContent, {
                contentErrors: validate(),
                patchResult
            });
        }
    }
}
function handleFind(findAndReplace) {
    debug('handleFind', findAndReplace);
    // TODO: implement handleFind
}
function handlePasteJson(newPastedJson) {
    debug('pasted json as text', newPastedJson);
    pastedJson = newPastedJson;
}
function findNextInside(path) {
    const index = parseInt(path[0], 10);
    const nextPath = [String(index + 1), ...path.slice(1)];
    return existsIn(json, nextPath)
        ? createValueSelection(nextPath, false)
        : createValueSelection(path, false);
}
export function focus() {
    debug('focus');
    // with just .focus(), sometimes the input doesn't react on onpaste events
    // in Chrome when having a large document open and then doing cut/paste.
    // Calling both .focus() and .select() did solve this issue.
    if (refHiddenInput) {
        refHiddenInput.focus();
        refHiddenInput.select();
    }
}
function handleScroll(event) {
    scrollTop = event.target['scrollTop'];
}
function handleMouseDown(event) {
    const target = event.target;
    const path = getDataPathFromTarget(target);
    if (path) {
        // when clicking inside the current selection, editing a value, do nothing
        if (isEditingSelection(documentState.selection) &&
            pathInSelection(json, documentState.selection, path)) {
            return;
        }
        updateSelection(createValueSelection(path, false));
        event.preventDefault();
    }
    // for example when clicking on the empty area in the main menu or on an InlineValue
    if (!target.isContentEditable) {
        setTimeout(focus);
    }
}
function createDefaultSelection() {
    if (isJSONArray(json) && !isEmpty(json) && !isEmpty(columns)) {
        // Select the first row, first column
        const path = ['0', ...columns[0]];
        return createValueSelection(path, false);
    }
    else {
        return null;
    }
}
function createDefaultSelectionWhenUndefined() {
    if (!documentState.selection) {
        updateSelection(createDefaultSelection());
    }
}
export function acceptAutoRepair() {
    if (textIsRepaired && json !== undefined) {
        const previousState = documentState;
        const previousJson = json;
        const previousText = text;
        const previousContent = { json, text };
        const previousTextIsRepaired = textIsRepaired;
        // json stays as is
        text = undefined;
        textIsRepaired = false;
        clearSelectionWhenNotExisting(json);
        addHistoryItem({
            previousJson,
            previousState,
            previousText,
            previousTextIsRepaired
        });
        // we could work out a patchResult, or use patch(), but only when the previous and new
        // contents are both json and not text. We go for simplicity and consistency here and
        // do _not_ return a patchResult ever.
        const patchResult = null;
        emitOnChange(previousContent, patchResult);
    }
    return { json, text };
}
/**
 * Scroll the window vertically to the node with given path.
 * Expand the path when needed.
 */
export function scrollTo(path, scrollToWhenVisible = true) {
    const searchBoxHeight = showSearch ? SEARCH_BOX_HEIGHT : 0;
    const top = calculateAbsolutePosition(path, columns, itemHeightsCache, defaultItemHeight);
    const roughDistance = top - scrollTop + searchBoxHeight + defaultItemHeight;
    const elem = findElement(path);
    debug('scrollTo', { path, top, scrollTop, elem });
    if (!refContents) {
        return Promise.resolve();
    }
    const viewPortRect = refContents.getBoundingClientRect();
    if (elem && !scrollToWhenVisible) {
        const elemRect = elem.getBoundingClientRect();
        if (elemRect.bottom > viewPortRect.top && elemRect.top < viewPortRect.bottom) {
            // element is fully or partially visible, don't scroll to it
            return Promise.resolve();
        }
    }
    const offset = -Math.max(searchBoxHeight + 2 * defaultItemHeight, viewPortRect.height / 4);
    if (elem) {
        return new Promise((resolve) => {
            jump(elem, {
                container: refContents,
                offset,
                duration: SCROLL_DURATION,
                callback: () => {
                    // TODO: improve horizontal scrolling: animate and integrate with the vertical scrolling (jump)
                    scrollToHorizontal(path);
                    resolve();
                }
            });
        });
    }
    else {
        return new Promise((resolve) => {
            jump(roughDistance, {
                container: refContents,
                offset,
                duration: SCROLL_DURATION,
                callback: async () => {
                    // ensure the element is rendered now that it is scrolled into view
                    await tick();
                    // TODO: improve horizontal scrolling: animate and integrate with the vertical scrolling (jump)
                    scrollToHorizontal(path);
                    resolve();
                }
            });
        });
    }
}
function scrollToVertical(path) {
    if (!refContents) {
        return;
    }
    const { rowIndex } = toTableCellPosition(path, columns);
    const top = calculateAbsolutePosition(path, columns, itemHeightsCache, defaultItemHeight);
    const bottom = top + (itemHeightsCache[rowIndex] || defaultItemHeight);
    const headerHeight = defaultItemHeight;
    const viewPortRect = refContents.getBoundingClientRect();
    const viewPortTop = scrollTop;
    const viewPortBottom = scrollTop + viewPortRect.height - headerHeight;
    if (bottom > viewPortBottom) {
        const diff = bottom - viewPortBottom;
        refContents.scrollTop += diff;
    }
    if (top < viewPortTop) {
        const diff = viewPortTop - top;
        refContents.scrollTop -= diff;
    }
}
function scrollToHorizontal(path) {
    const elem = findElement(path);
    if (!elem || !refContents) {
        return;
    }
    const viewPortRect = refContents.getBoundingClientRect();
    const elemRect = elem.getBoundingClientRect(); // TODO: scroll to column instead of item (is always rendered)
    if (elemRect.right > viewPortRect.right) {
        const diff = elemRect.right - viewPortRect.right;
        refContents.scrollLeft += diff;
    }
    if (elemRect.left < viewPortRect.left) {
        const diff = viewPortRect.left - elemRect.left;
        refContents.scrollLeft -= diff;
    }
}
function scrollIntoView(path) {
    scrollToVertical(path);
    scrollToHorizontal(path);
}
/**
 * Find the DOM element of a given path.
 * Note that the path can only be found when the node is expanded.
 */
export function findElement(path) {
    const column = columns.find((c) => pathStartsWith(path.slice(1), c));
    const resolvedPath = column ? path.slice(0, 1).concat(column) : path;
    return refContents
        ? refContents.querySelector(`td[data-path="${encodeDataPath(resolvedPath)}"]`)
        : null;
}
function openContextMenu({ anchor, left, top, width, height, offsetTop, offsetLeft, showTip }) {
    const defaultItems = createTableContextMenuItems({
        json,
        documentState,
        readOnly,
        parser,
        onEditValue: handleEditValue,
        onEditRow: handleEditRow,
        onToggleEnforceString: handleToggleEnforceString,
        onCut: handleCut,
        onCopy: handleCopy,
        onPaste: handlePasteFromMenu,
        onRemove: handleRemove,
        onDuplicateRow: handleDuplicateRow,
        onInsertBeforeRow: handleInsertBeforeRow,
        onInsertAfterRow: handleInsertAfterRow,
        onRemoveRow: handleRemoveRow
    });
    const items = onRenderContextMenu(defaultItems);
    if (items === false) {
        return;
    }
    const props = {
        tip: showTip
            ? 'Tip: you can open this context menu via right-click or with Ctrl+Q'
            : undefined,
        items,
        onRequestClose: function () {
            closeAbsolutePopup(popupId);
            focus();
        }
    };
    const options = {
        left,
        top,
        offsetTop,
        offsetLeft,
        width,
        height,
        anchor,
        closeOnOuterClick: true,
        onClose: () => {
            modalOpen = false;
            focus();
        }
    };
    modalOpen = true;
    const popupId = openAbsolutePopup(ContextMenu, props, options);
}
function handleContextMenu(event) {
    if (isEditingSelection(documentState.selection)) {
        return;
    }
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    if (event && event.type === 'contextmenu' && event.target !== refHiddenInput) {
        // right mouse click to open context menu
        openContextMenu({
            left: event.clientX,
            top: event.clientY,
            width: CONTEXT_MENU_WIDTH,
            height: CONTEXT_MENU_HEIGHT,
            showTip: false
        });
    }
    else {
        // type === 'keydown' (from the quick key Ctrl+Q)
        // or target is hidden input -> context menu button on keyboard
        const anchor = refContents?.querySelector('.jse-table-cell.jse-selected-value');
        if (anchor) {
            openContextMenu({
                anchor,
                offsetTop: 2,
                width: CONTEXT_MENU_WIDTH,
                height: CONTEXT_MENU_HEIGHT,
                showTip: false
            });
        }
        else {
            // fallback on just displaying the TreeContextMenu top left
            const rect = refContents?.getBoundingClientRect();
            if (rect) {
                openContextMenu({
                    top: rect.top + 2,
                    left: rect.left + 2,
                    width: CONTEXT_MENU_WIDTH,
                    height: CONTEXT_MENU_HEIGHT,
                    showTip: false
                });
            }
        }
    }
    return false;
}
function handleContextMenuFromTableMenu(event) {
    openContextMenu({
        anchor: findParentWithNodeName(event.target, 'BUTTON'),
        offsetTop: 0,
        width: CONTEXT_MENU_WIDTH,
        height: CONTEXT_MENU_HEIGHT,
        showTip: true
    });
}
function handleEditValue() {
    if (readOnly || !documentState.selection) {
        return;
    }
    const path = getFocusPath(documentState.selection);
    const value = getIn(json, path);
    if (isObjectOrArray(value)) {
        openJSONEditorModal(path);
    }
    else {
        updateSelection(createValueSelection(path, true));
    }
}
function handleEditRow() {
    if (readOnly || !documentState.selection) {
        return;
    }
    const path = getFocusPath(documentState.selection);
    const pathRow = path.slice(0, 1);
    openJSONEditorModal(pathRow);
}
function handleToggleEnforceString() {
    if (readOnly || !isValueSelection(documentState.selection)) {
        return;
    }
    const path = documentState.selection.path;
    const pointer = compileJSONPointer(path);
    const value = getIn(json, path);
    const enforceString = !getEnforceString(value, documentState.enforceStringMap, pointer, parser);
    const updatedValue = enforceString ? String(value) : stringConvert(String(value), parser);
    debug('handleToggleEnforceString', { enforceString, value, updatedValue });
    handlePatch([
        {
            op: 'replace',
            path: pointer,
            value: updatedValue
        }
    ], (_, patchedState) => {
        return {
            state: setEnforceString(patchedState, pointer, enforceString)
        };
    });
}
async function handleParsePastedJson() {
    debug('apply pasted json', pastedJson);
    if (!pastedJson) {
        return;
    }
    const { path, contents } = pastedJson;
    // exit edit mode
    const refEditableDiv = refContents?.querySelector('.jse-editable-div') || null;
    if (isEditableDivRef(refEditableDiv)) {
        refEditableDiv.cancel();
    }
    // replace the value with the JSON object/array
    const operations = [
        {
            op: 'replace',
            path: compileJSONPointer(path),
            value: contents
        }
    ];
    handlePatch(operations);
    // TODO: get rid of the setTimeout here
    setTimeout(focus);
}
function handlePasteFromMenu() {
    open(CopyPasteModal, {}, {
        ...SIMPLE_MODAL_OPTIONS,
        styleWindow: {
            width: '450px'
        }
    }, {
        onClose: () => focus()
    });
}
function handleClearPastedJson() {
    debug('clear pasted json');
    pastedJson = undefined;
    focus();
}
function handleRequestRepair() {
    onChangeMode(Mode.text);
}
async function handleCut(indent) {
    await onCut({
        json,
        documentState,
        indentation: indent ? indentation : undefined,
        readOnly,
        parser,
        onPatch: handlePatch
    });
}
async function handleCopy(indent = true) {
    if (json === undefined) {
        return;
    }
    await onCopy({
        json,
        documentState,
        indentation: indent ? indentation : undefined,
        parser
    });
}
function handleRemove() {
    onRemove({
        json,
        text,
        documentState,
        keepSelection: true,
        readOnly,
        onChange,
        onPatch: handlePatch
    });
}
function handleDuplicateRow() {
    onDuplicateRow({ json, documentState, columns, readOnly, onPatch: handlePatch });
}
function handleInsertBeforeRow() {
    onInsertBeforeRow({ json, documentState, columns, readOnly, onPatch: handlePatch });
}
function handleInsertAfterRow() {
    onInsertAfterRow({ json, documentState, columns, readOnly, onPatch: handlePatch });
}
function handleRemoveRow() {
    onRemoveRow({ json, documentState, columns, readOnly, onPatch: handlePatch });
}
async function handleInsertCharacter(char) {
    await onInsertCharacter({
        char,
        selectInside: false,
        refJsonEditor,
        json,
        selection: documentState.selection,
        readOnly,
        parser,
        onPatch: handlePatch,
        onReplaceJson: handleReplaceJson,
        onSelect: updateSelection
    });
}
function handleKeyDown(event) {
    const combo = keyComboFromEvent(event);
    debug('keydown', { combo, key: event.key });
    if (combo === 'Ctrl+X') {
        // cut formatted
        event.preventDefault();
        handleCut(true);
    }
    if (combo === 'Ctrl+Shift+X') {
        // cut compact
        event.preventDefault();
        handleCut(false);
    }
    if (combo === 'Ctrl+C') {
        // copy formatted
        event.preventDefault();
        handleCopy(true);
    }
    if (combo === 'Ctrl+Shift+C') {
        // copy compact
        event.preventDefault();
        handleCopy(false);
    }
    // Note: Ctrl+V (paste) is handled by the on:paste event
    if (combo === 'Ctrl+D') {
        event.preventDefault();
        // handleDuplicate()
        // TODO: implement duplicate
    }
    if (combo === 'Delete' || combo === 'Backspace') {
        event.preventDefault();
        handleRemove();
    }
    if (combo === 'Insert') {
        event.preventDefault();
        // TODO: implement insert
    }
    if (combo === 'Ctrl+A') {
        event.preventDefault();
        // updateSelection(selectAll())
        // TODO: implement select all
    }
    if (combo === 'Ctrl+Q') {
        handleContextMenu(event);
    }
    if (combo === 'ArrowLeft') {
        event.preventDefault();
        createDefaultSelectionWhenUndefined();
        if (documentState.selection) {
            const newSelection = selectPreviousColumn(columns, documentState.selection);
            updateSelection(newSelection);
            scrollIntoView(getFocusPath(newSelection));
        }
    }
    if (combo === 'ArrowRight') {
        event.preventDefault();
        createDefaultSelectionWhenUndefined();
        if (documentState.selection) {
            const newSelection = selectNextColumn(columns, documentState.selection);
            updateSelection(newSelection);
            scrollIntoView(getFocusPath(newSelection));
        }
    }
    if (combo === 'ArrowUp') {
        event.preventDefault();
        createDefaultSelectionWhenUndefined();
        if (documentState.selection) {
            const newSelection = selectPreviousRow(columns, documentState.selection);
            updateSelection(newSelection);
            scrollIntoView(getFocusPath(newSelection));
        }
    }
    if (combo === 'ArrowDown') {
        event.preventDefault();
        createDefaultSelectionWhenUndefined();
        if (documentState.selection) {
            const newSelection = selectNextRow(json, columns, documentState.selection);
            updateSelection(newSelection);
            scrollIntoView(getFocusPath(newSelection));
        }
    }
    if (combo === 'Enter' && documentState.selection) {
        if (isValueSelection(documentState.selection)) {
            event.preventDefault();
            const path = documentState.selection.path;
            const value = getIn(json, path);
            if (isObjectOrArray(value)) {
                // edit nested object/array
                openJSONEditorModal(path);
            }
            else {
                if (!readOnly) {
                    // go to value edit mode
                    updateSelection({ ...documentState.selection, edit: true });
                }
            }
        }
    }
    const normalizedCombo = combo.replace(/^Shift\+/, ''); // replace 'Shift+A' with 'A'
    if (normalizedCombo.length === 1 && documentState.selection) {
        // a regular key like a, A, _, etc is entered.
        // Replace selected contents with a new value having this first character as text
        event.preventDefault();
        handleInsertCharacter(event.key);
        return;
    }
    if (combo === 'Ctrl+Enter' && isValueSelection(documentState.selection)) {
        const value = getIn(json, documentState.selection.path);
        if (isUrl(value)) {
            // open url in new page
            window.open(String(value), '_blank');
        }
    }
    if (combo === 'Escape' && documentState.selection) {
        event.preventDefault();
        updateSelection(null);
    }
    if (combo === 'Ctrl+F') {
        event.preventDefault();
        openFind(false);
    }
    if (combo === 'Ctrl+H') {
        event.preventDefault();
        openFind(true);
    }
    if (combo === 'Ctrl+Z') {
        event.preventDefault();
        handleUndo();
    }
    if (combo === 'Ctrl+Shift+Z') {
        event.preventDefault();
        handleRedo();
    }
}
function handlePaste(event) {
    event.preventDefault();
    const clipboardText = event.clipboardData?.getData('text/plain');
    if (clipboardText === undefined) {
        return;
    }
    onPaste({
        clipboardText,
        json,
        selection: documentState.selection,
        readOnly,
        parser,
        onPatch: handlePatch,
        onChangeText: handleChangeText,
        openRepairModal
    });
}
// TODO: this function is duplicated from TreeMode. See if we can reuse the code instead
function handleReplaceJson(updatedJson, afterPatch) {
    const previousState = documentState;
    const previousJson = json;
    const previousText = text;
    const previousContent = { json, text };
    const previousTextIsRepaired = textIsRepaired;
    const updatedState = expandWithCallback(json, documentState, [], expandMinimal);
    const callback = typeof afterPatch === 'function' ? afterPatch(updatedJson, updatedState) : undefined;
    json = callback && callback.json !== undefined ? callback.json : updatedJson;
    documentState = callback && callback.state !== undefined ? callback.state : updatedState;
    text = undefined;
    textIsRepaired = false;
    parseError = undefined;
    // make sure the selection is valid
    clearSelectionWhenNotExisting(json);
    addHistoryItem({
        previousJson,
        previousState,
        previousText,
        previousTextIsRepaired
    });
    // we could work out a patchResult, or use patch(), but only when the previous and new
    // contents are both json and not text. We go for simplicity and consistency here and
    // do _not_ return a patchResult ever.
    const patchResult = null;
    emitOnChange(previousContent, patchResult);
}
// TODO: this function is duplicated from TreeMode. See if we can reuse the code instead
function handleChangeText(updatedText, afterPatch) {
    debug('handleChangeText');
    const previousState = documentState;
    const previousJson = json;
    const previousText = text;
    const previousContent = { json, text };
    const previousTextIsRepaired = textIsRepaired;
    try {
        json = parseMemoizeOne(updatedText);
        documentState = expandWithCallback(json, documentState, [], expandMinimal);
        text = undefined;
        textIsRepaired = false;
        parseError = undefined;
    }
    catch (err) {
        try {
            json = parseMemoizeOne(jsonrepair(updatedText));
            documentState = expandWithCallback(json, documentState, [], expandMinimal);
            text = updatedText;
            textIsRepaired = true;
            parseError = undefined;
        }
        catch (repairError) {
            // no valid JSON, will show empty document or invalid json
            json = undefined;
            documentState = createDocumentState({ json, expand: expandMinimal });
            text = updatedText;
            textIsRepaired = false;
            parseError =
                text !== ''
                    ? normalizeJsonParseError(text, err.message || String(err))
                    : undefined;
        }
    }
    if (typeof afterPatch === 'function') {
        const callback = afterPatch(json, documentState);
        json = callback && callback.json ? callback.json : json;
        documentState = callback && callback.state ? callback.state : documentState;
    }
    // ensure the selection is valid
    clearSelectionWhenNotExisting(json);
    addHistoryItem({
        previousJson,
        previousState,
        previousText,
        previousTextIsRepaired
    });
    // no JSON patch actions available in text mode
    const patchResult = null;
    emitOnChange(previousContent, patchResult);
}
function handleSelectValidationError(error) {
    debug('select validation error', error);
    updateSelection(createValueSelection(error.path, false));
    scrollTo(error.path);
}
function openSortModal(rootPath) {
    if (readOnly || json === undefined) {
        return;
    }
    modalOpen = true;
    onSortModal({
        id: sortModalId,
        json,
        rootPath,
        onSort: ({ operations, itemPath, direction }) => {
            debug('onSort', operations, rootPath, itemPath, direction);
            handlePatch(operations, (_, patchedState) => {
                return {
                    state: {
                        ...patchedState,
                        sortedColumn: {
                            path: itemPath,
                            sortDirection: direction === -1 ? SortDirection.desc : SortDirection.asc
                        }
                    }
                };
            });
        },
        onClose: () => {
            modalOpen = false;
            focus();
        }
    });
}
/**
 * This method is exposed via JSONEditor.transform
 */
export function openTransformModal(options) {
    if (json === undefined) {
        return;
    }
    const { id, onTransform, onClose } = options;
    const rootPath = options.rootPath || [];
    modalOpen = true;
    onTransformModal({
        id: id || transformModalId,
        json,
        rootPath: rootPath || [],
        onTransform: (operations) => {
            if (onTransform) {
                onTransform({
                    operations,
                    json: json,
                    transformedJson: immutableJSONPatch(json, operations)
                });
            }
            else {
                debug('onTransform', rootPath, operations);
                handlePatch(operations);
            }
        },
        onClose: () => {
            modalOpen = false;
            focus();
            if (onClose) {
                onClose();
            }
        }
    });
}
function openJSONEditorModal(path) {
    debug('openJSONEditorModal', { path });
    modalOpen = true;
    // open a popup where you can edit the nested object/array
    onJSONEditorModal({
        content: {
            json: getIn(json, path)
        },
        path,
        onPatch: context.onPatch,
        onClose: () => {
            modalOpen = false;
            focus();
        }
    });
}
function openRepairModal(text, onApply) {
    open(JSONRepairModal, {
        text,
        onParse: (text) => parsePartialJson(text, (t) => parseAndRepair(t, parser)),
        onRepair: repairPartialJson,
        onApply
    }, {
        ...SIMPLE_MODAL_OPTIONS,
        styleWindow: {
            width: '600px',
            height: '500px'
        },
        styleContent: {
            padding: 0,
            height: '100%'
        }
    }, {
        onClose: () => focus()
    });
}
function handleSortAll() {
    const rootPath = [];
    openSortModal(rootPath);
}
function handleTransformAll() {
    openTransformModal({
        rootPath: []
    });
}
function openFind(findAndReplace) {
    debug('openFind', { findAndReplace });
    showSearch = false;
    showReplace = false;
    tick().then(() => {
        // trick to make sure the focus goes to the search box
        showSearch = true;
        showReplace = findAndReplace;
    });
}
function handleUndo() {
    if (readOnly) {
        return;
    }
    if (!history.getState().canUndo) {
        return;
    }
    const item = history.undo();
    if (!item) {
        return;
    }
    const previousContent = { json, text };
    json = item.undo.patch ? immutableJSONPatch(json, item.undo.patch) : item.undo.json;
    documentState = item.undo.state;
    text = item.undo.text;
    textIsRepaired = item.undo.textIsRepaired;
    parseError = undefined;
    debug('undo', { item, json });
    const patchResult = item.undo.patch && item.redo.patch
        ? {
            json,
            previousJson: previousContent.json,
            redo: item.undo.patch,
            undo: item.redo.patch
        }
        : null;
    emitOnChange(previousContent, patchResult);
    focus();
    if (documentState.selection) {
        scrollTo(getFocusPath(documentState.selection), false);
    }
}
function handleRedo() {
    if (readOnly) {
        return;
    }
    if (!history.getState().canRedo) {
        return;
    }
    const item = history.redo();
    if (!item) {
        return;
    }
    const previousContent = { json, text };
    json = item.redo.patch ? immutableJSONPatch(json, item.redo.patch) : item.redo.json;
    documentState = item.redo.state;
    text = item.redo.text;
    textIsRepaired = item.redo.textIsRepaired;
    parseError = undefined;
    debug('redo', { item, json });
    const patchResult = item.undo.patch && item.redo.patch
        ? {
            json,
            previousJson: previousContent.json,
            redo: item.redo.patch,
            undo: item.undo.patch
        }
        : null;
    emitOnChange(previousContent, patchResult);
    focus();
    if (documentState.selection) {
        scrollTo(getFocusPath(documentState.selection), false);
    }
}
function handleResizeContents(element) {
    viewPortHeight = element.getBoundingClientRect().height;
}
function handleResizeRow(element, rowIndex) {
    itemHeightsCache[rowIndex] = element.getBoundingClientRect().height;
}
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<div
  role="table"
  class="jse-table-mode"
  class:no-main-menu={!mainMenuBar}
  on:mousedown={handleMouseDown}
  on:keydown={handleKeyDown}
  on:contextmenu={handleContextMenu}
  bind:this={refJsonEditor}
>
  {#if mainMenuBar}
    <TableMenu
      {containsValidArray}
      {readOnly}
      bind:showSearch
      {historyState}
      onSort={handleSortAll}
      onTransform={handleTransformAll}
      onUndo={handleUndo}
      onRedo={handleRedo}
      onContextMenu={handleContextMenuFromTableMenu}
      {onRenderMenu}
    />
  {/if}

  {#if !isSSR}
    <label class="jse-hidden-input-label">
      <input
        type="text"
        readonly={true}
        tabindex="-1"
        class="jse-hidden-input"
        bind:this={refHiddenInput}
        on:paste={handlePaste}
      />
    </label>
    {#if containsValidArray}
      <div class="jse-search-box-container">
        <SearchBox
          {json}
          {documentState}
          {parser}
          {showSearch}
          {showReplace}
          {readOnly}
          {columns}
          onSearch={handleSearch}
          onFocus={handleFocusSearch}
          onPatch={handlePatch}
          onClose={handleCloseSearch}
        />
      </div>
      <div
        class="jse-contents"
        bind:this={refContents}
        use:resizeObserver={handleResizeContents}
        on:scroll={handleScroll}
      >
        <table class="jse-table-main">
          <tbody>
            <tr class="jse-table-row jse-table-row-header">
              <th class="jse-table-cell jse-table-cell-header">
                {#if !isEmpty(groupedValidationErrors?.root)}
                  {@const validationError = mergeValidationErrors(
                    [],
                    groupedValidationErrors?.root
                  )}
                  {#if validationError}
                    <div class="jse-table-root-error">
                      <ValidationErrorIcon {validationError} onExpand={noop} />
                    </div>
                  {/if}
                {/if}
              </th>
              {#each columns as column}
                <th class="jse-table-cell jse-table-cell-header">
                  <ColumnHeader
                    path={column}
                    sortedColumn={documentState.sortedColumn}
                    {readOnly}
                    onSort={onSortByHeader}
                  />
                </th>
              {/each}
              {#if showRefreshButton}
                <th class="jse-table-cell jse-table-cell-header">
                  <RefreshColumnHeader
                    count={Array.isArray(json) ? json.length : 0}
                    {maxSampleCount}
                    onRefresh={() => (maxSampleCount = Infinity)}
                  />
                </th>
              {/if}
            </tr>
            <tr class="jse-table-invisible-start-section">
              <td style:height={visibleSection.startHeight + 'px'} colspan={columns.length} />
            </tr>
            {#each visibleSection.visibleItems as item, visibleIndex}
              {@const rowIndex = visibleSection.startIndex + visibleIndex}
              {@const validationErrorsByRow = groupedValidationErrors.rows[rowIndex]}
              {@const validationError = mergeValidationErrors(
                [String(rowIndex)],
                validationErrorsByRow?.row
              )}
              {@const searchResultItemsByRow = searchResult?.itemsMap
                ? filterPointerOrUndefined(searchResult?.itemsMap, compileJSONPointerProp(rowIndex))
                : undefined}
              <tr class="jse-table-row">
                {#key rowIndex}
                  <th
                    class="jse-table-cell jse-table-cell-gutter"
                    use:resizeObserver={(element) => handleResizeRow(element, rowIndex)}
                  >
                    {rowIndex}
                    {#if validationError}
                      <ValidationErrorIcon {validationError} onExpand={noop} />
                    {/if}
                  </th>
                {/key}
                {#each columns as column, columnIndex}
                  {@const path = [String(rowIndex)].concat(column)}
                  {@const pointer = compileJSONPointer(path)}
                  {@const value = getIn(item, column)}
                  {@const isSelected =
                    isValueSelection(documentState.selection) &&
                    pathStartsWith(documentState.selection.path, path)}
                  {@const validationErrorsByColumn = validationErrorsByRow?.columns[columnIndex]}
                  {@const validationError = mergeValidationErrors(path, validationErrorsByColumn)}
                  <td
                    class="jse-table-cell"
                    data-path={encodeDataPath(path)}
                    class:jse-selected-value={isSelected}
                  >
                    {#if isObjectOrArray(value)}
                      {@const searchResultItemsByCell = searchResultItemsByRow
                        ? filterPointerOrUndefined(searchResultItemsByRow, pointer)
                        : undefined}
                      {@const containsActiveSearchResult = searchResultItemsByCell
                        ? Object.values(searchResultItemsByCell).some((items) =>
                            items.some((item) => item.active)
                          )
                        : false}

                      <InlineValue
                        {path}
                        {value}
                        {parser}
                        {isSelected}
                        containsSearchResult={!isEmpty(searchResultItemsByCell)}
                        {containsActiveSearchResult}
                        onEdit={openJSONEditorModal}
                      />{:else}
                      {@const searchResultItemsByCell = searchResult?.itemsMap
                        ? filterValueSearchResults(searchResult?.itemsMap, pointer)
                        : undefined}

                      <JSONValueComponent
                        {path}
                        value={value !== undefined ? value : ''}
                        enforceString={getEnforceString(
                          value,
                          documentState.enforceStringMap,
                          pointer,
                          context.parser
                        )}
                        selection={isSelected ? documentState.selection : null}
                        searchResultItems={searchResultItemsByCell}
                        {context}
                      />{/if}{#if !readOnly && isSelected && !isEditingSelection(documentState.selection)}
                      <div class="jse-context-menu-anchor">
                        <ContextMenuPointer selected={true} onContextMenu={openContextMenu} />
                      </div>
                    {/if}{#if validationError}
                      <ValidationErrorIcon {validationError} onExpand={noop} />
                    {/if}
                  </td>
                {/each}
                {#if showRefreshButton}
                  <td class="jse-table-cell" />
                {/if}
              </tr>
            {/each}

            <tr class="jse-table-invisible-end-section">
              <td style:height={visibleSection.endHeight + 'px'} colspan={columns.length} />
            </tr>
          </tbody>
        </table>
      </div>

      {#if pastedJson}
        <Message
          type="info"
          message={`You pasted a JSON ${
            Array.isArray(pastedJson.contents) ? 'array' : 'object'
          } as text`}
          actions={[
            {
              icon: faWrench,
              text: 'Paste as JSON instead',
              title: 'Paste the text as JSON instead of a single value',
              // We use mousedown here instead of click: this message pops up
              // whilst the user is editing a value. When clicking this button,
              // the actual value is applied and the event is not propagated
              // and an onClick on this button never happens.
              onMouseDown: handleParsePastedJson
            },
            {
              text: 'Leave as is',
              title: 'Keep the pasted content as a single value',
              onClick: handleClearPastedJson
            }
          ]}
        />
      {/if}

      {#if textIsRepaired}
        <Message
          type="success"
          message="The loaded JSON document was invalid but is successfully repaired."
          actions={!readOnly
            ? [
                {
                  icon: faCheck,
                  text: 'Ok',
                  title: 'Accept the repaired document',
                  onClick: acceptAutoRepair
                },
                {
                  icon: faCode,
                  text: 'Repair manually instead',
                  title: 'Leave the document unchanged and repair it manually instead',
                  onClick: handleRequestRepair
                }
              ]
            : []}
          onClose={focus}
        />
      {/if}

      <ValidationErrorsOverview {validationErrors} selectError={handleSelectValidationError} />
    {:else if parseError && text !== undefined && text !== ''}
      <Message
        type="error"
        message="The loaded JSON document is invalid and could not be repaired automatically."
        actions={!readOnly
          ? [
              {
                icon: faCode,
                text: 'Repair manually',
                title: 'Open the document in "code" mode and repair it manually',
                onClick: handleRequestRepair
              }
            ]
          : []}
      />
      <JSONPreview {text} {json} {indentation} {parser} />
    {:else}
      <TableModeWelcome
        {text}
        {json}
        {readOnly}
        {parser}
        {openJSONEditorModal}
        {onChangeMode}
        onClick={() => {
          // FIXME: this is a workaround for the editor not putting the focus on refHiddenInput
          //  when clicking in the welcome screen so you cannot paste a document from clipboard.
          focus()
        }}
      />
    {/if}
  {:else}
    <div class="jse-contents jse-contents-loading">
      <div class="jse-loading-space" />
      <div class="jse-loading">loading...</div>
    </div>
  {/if}
</div>

<style src="./TableMode.scss">/* over all fonts, sizes, and colors */
/* "consolas" for Windows, "menlo" for Mac with fallback to "monaco", 'Ubuntu Mono' for Ubuntu */
/* (at Mac this font looks too large at 14px, but 13px is too small for the font on Windows) */
/* main, menu, modal */
/* jsoneditor modal */
/* deprecated since 2023-12-04: --jse-modal-theme-color has been renamed to --jse-modal-editor-theme-color */
/* tooltip in text mode */
/* panels: navigation bar, gutter, search box */
/* navigation-bar */
/* context menu */
/* contents: json key and values */
/* contents: selected or hovered */
/* contents: section of collapsed items in an array */
/* contents: highlighting of search matches */
/* contents: inline tags inside the JSON document */
/* contents: table */
/* controls in modals: inputs, buttons, and `a` */
/* messages */
/* svelte-select */
/* color picker */
.jse-table-mode {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  background: var(--jse-background-color, #fff);
  min-width: 0;
  min-height: 0;
  font-family: var(--jse-font-family-mono, consolas, menlo, monaco, "Ubuntu Mono", "source-code-pro", monospace);
  font-size: var(--jse-font-size-mono, 14px);
  color: var(--jse-text-color, #4d4d4d);
  line-height: var(--jse-line-height, calc(1em + 4px));
}
.jse-table-mode.no-main-menu {
  border-top: var(--jse-main-border, 1px solid #d7d7d7);
}
.jse-table-mode .jse-search-box-container {
  position: relative;
  height: 0;
  top: calc(var(--jse-line-height, calc(1em + 4px)) + 2 * var(--jse-padding, 10px));
  margin-right: calc(var(--jse-padding, 10px) + 20px);
  margin-left: var(--jse-padding, 10px);
  text-align: right;
  z-index: 3;
}
.jse-table-mode .jse-hidden-input-label {
  position: fixed;
  right: 0;
  top: 0;
  width: 0;
  height: 0;
}
.jse-table-mode .jse-hidden-input-label .jse-hidden-input {
  width: 0;
  height: 0;
  padding: 0;
  border: 0;
  outline: none;
}
.jse-table-mode .jse-contents {
  flex: 1;
  align-items: flex-start;
  flex-direction: column;
  display: flex;
  overflow: auto;
  overflow-anchor: none;
  scrollbar-gutter: stable;
  border-left: var(--jse-main-border, 1px solid #d7d7d7);
  border-right: var(--jse-main-border, 1px solid #d7d7d7);
}
.jse-table-mode .jse-contents:last-child {
  border-bottom: var(--jse-main-border, 1px solid #d7d7d7);
}
.jse-table-mode .jse-contents table.jse-table-main {
  border-collapse: collapse;
  border-spacing: 0;
}
.jse-table-mode .jse-contents table.jse-table-main .jse-table-invisible-start-section td,
.jse-table-mode .jse-contents table.jse-table-main .jse-table-invisible-end-section td {
  margin: 0;
  padding: 0;
}
.jse-table-mode .jse-contents table.jse-table-main .jse-table-invisible-end-section td {
  padding-bottom: var(--jse-padding, 10px);
}
.jse-table-mode .jse-contents table.jse-table-main .jse-table-row:hover {
  background-color: var(--jse-table-row-odd-background, rgba(0, 0, 0, 0.05));
}
.jse-table-mode .jse-contents table.jse-table-main .jse-table-row .jse-table-cell {
  padding: 0 var(--jse-padding, 10px) 0 0;
  vertical-align: top;
  white-space: nowrap;
  height: var(--jse-line-height, calc(1em + 4px));
}
.jse-table-mode .jse-contents table.jse-table-main .jse-table-row .jse-table-cell.jse-table-cell-header, .jse-table-mode .jse-contents table.jse-table-main .jse-table-row .jse-table-cell.jse-table-cell-gutter {
  font-weight: normal;
  text-align: left;
  color: var(--jse-text-readonly, #8d8d8d);
  background: var(--jse-table-header-background, #f5f5f5);
}
.jse-table-mode .jse-contents table.jse-table-main .jse-table-row .jse-table-cell.jse-table-cell-header {
  padding: 0;
  position: sticky;
  top: 0;
}
.jse-table-mode .jse-contents table.jse-table-main .jse-table-row .jse-table-cell.jse-table-cell-header .jse-table-root-error {
  padding: calc(0.5 * var(--jse-padding, 10px)) var(--jse-padding, 10px) calc(0.5 * var(--jse-padding, 10px)) calc(0.5 * var(--jse-padding, 10px));
}
.jse-table-mode .jse-contents table.jse-table-main .jse-table-row .jse-table-cell.jse-table-cell-gutter {
  padding: 0 var(--jse-padding, 10px) 0 calc(0.5 * var(--jse-padding, 10px));
}
.jse-table-mode .jse-contents table.jse-table-main .jse-table-row .jse-table-cell.jse-selected-value > :global(.jse-value) {
  background: var(--jse-selection-background-color, #d3d3d3);
}
.jse-table-mode .jse-contents table.jse-table-main .jse-table-row .jse-table-cell :global(div.jse-value) {
  overflow-wrap: normal;
  white-space: nowrap;
  vertical-align: top;
  display: inline-block;
}
.jse-table-mode .jse-contents table.jse-table-main .jse-table-row .jse-table-cell .jse-context-menu-anchor {
  display: inline-flex;
  position: relative;
  vertical-align: top;
}
.jse-table-mode .jse-contents.jse-contents-loading {
  align-items: unset;
}
.jse-table-mode .jse-contents.jse-contents-loading .jse-loading-space {
  flex: 1;
}
.jse-table-mode .jse-contents.jse-contents-loading .jse-loading {
  flex: 2;
  text-align: center;
  color: var(--jse-panel-color-readonly, #b2b2b2);
  box-sizing: border-box;
  font-family: var(--jse-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif);
  font-size: var(--jse-font-size, 16px);
}</style>
