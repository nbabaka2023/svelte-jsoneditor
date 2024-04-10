<svelte:options immutable={true} />

<script>import { faExclamationTriangle, faEye, faTimes, faWrench } from '@fortawesome/free-solid-svg-icons';
import { createDebug } from '../../../utils/debug.js';
import { immutableJSONPatch, revertJSONPatch } from 'immutable-json-patch';
import { jsonrepair } from 'jsonrepair';
import { debounce, isEqual, uniqueId } from 'lodash-es';
import { onDestroy, onMount, tick } from 'svelte';
import { JSON_STATUS_INVALID, JSON_STATUS_REPAIRABLE, JSON_STATUS_VALID, MAX_CHARACTERS_TEXT_PREVIEW, MAX_DOCUMENT_SIZE_TEXT_MODE, TEXT_MODE_ONCHANGE_DELAY } from '../../../constants.js';
import { activeElementIsChildOf, createNormalizationFunctions, getWindow } from '../../../utils/domUtils.js';
import { formatSize } from '../../../utils/fileUtils.js';
import { findTextLocation, getText, needsFormatting } from '../../../utils/jsonUtils.js';
import { createFocusTracker } from '../../controls/createFocusTracker.js';
import Message from '../../controls/Message.svelte';
import ValidationErrorsOverview from '../../controls/ValidationErrorsOverview.svelte';
import TextMenu from './menu/TextMenu.svelte';
import { Compartment, EditorSelection, EditorState } from '@codemirror/state';
import { crosshairCursor, drawSelection, dropCursor, EditorView, highlightActiveLine, highlightActiveLineGutter, highlightSpecialChars, keymap, lineNumbers, rectangularSelection } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab, redo, redoDepth, undo, undoDepth } from '@codemirror/commands';
import { linter, lintGutter, lintKeymap } from '@codemirror/lint';
import { json as jsonLang } from '@codemirror/lang-json';
import { bracketMatching, defaultHighlightStyle, foldGutter, foldKeymap, indentOnInput, indentUnit, syntaxHighlighting } from '@codemirror/language';
import { closeSearchPanel, highlightSelectionMatches, openSearchPanel, search, searchKeymap } from '@codemirror/search';
import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import jsonSourceMap from 'json-source-map';
import StatusBar from './StatusBar.svelte';
import { highlighter } from './codemirror/codemirror-theme.js';
import { Mode, SelectionType, ValidationSeverity } from '../../../types.js';
import { isContentParseError, isContentValidationErrors } from '../../../typeguards.js';
import memoizeOne from 'memoize-one';
import { validateText } from '../../../logic/validation.js';
import { truncate } from '../../../utils/stringUtils.js';
import { faJSONEditorFormat } from '../../../img/customFontawesomeIcons.js';
import { indentationMarkers } from '@replit/codemirror-indentation-markers';
import { isTextSelection } from '../../../logic/selection.js';
import { wrappedLineIndent } from 'codemirror-wrapped-line-indent';
export let readOnly;
export let mainMenuBar;
export let statusBar;
export let askToFormat;
export let externalContent;
export let externalSelection;
export let indentation;
export let tabSize;
export let escapeUnicodeCharacters;
export let parser;
export let validator;
export let validationParser;
export let onChange;
export let onChangeMode;
export let onSelect;
export let onError;
export let onFocus;
export let onBlur;
export let onRenderMenu;
export let onSortModal;
export let onTransformModal;
const debug = createDebug('jsoneditor:TextMode');
const formatCompactKeyBinding = {
    key: 'Mod-i',
    run: handleFormat,
    shift: handleCompact,
    preventDefault: true
};
const isSSR = typeof window === 'undefined';
debug('isSSR:', isSSR);
let codeMirrorRef;
let domTextMode;
let codeMirrorView;
let editorState;
let onChangeDisabled = false;
let acceptTooLarge = false;
let validationErrors = [];
const linterCompartment = new Compartment();
const readOnlyCompartment = new Compartment();
const indentCompartment = new Compartment();
const tabSizeCompartment = new Compartment();
const themeCompartment = new Compartment();
let content = externalContent;
let text = getText(content, indentation, parser); // text is just a cached version of content.text or parsed content.json
$: normalization = createNormalizationFunctions({
    escapeControlCharacters: false,
    escapeUnicodeCharacters
});
$: setCodeMirrorContent(externalContent, false, false);
$: applyExternalSelection(externalSelection);
$: updateLinter(validator);
$: updateIndentation(indentation);
$: updateTabSize(tabSize);
$: updateReadOnly(readOnly);
// force updating the text when escapeUnicodeCharacters changes
let previousEscapeUnicodeCharacters = escapeUnicodeCharacters;
$: {
    if (previousEscapeUnicodeCharacters !== escapeUnicodeCharacters) {
        previousEscapeUnicodeCharacters = escapeUnicodeCharacters;
        forceUpdateText();
    }
}
onMount(async () => {
    if (isSSR) {
        return;
    }
    try {
        codeMirrorView = createCodeMirrorView({
            target: codeMirrorRef,
            initialText: !disableTextEditor(text, acceptTooLarge)
                ? normalization.escapeValue(text)
                : '',
            readOnly,
            indentation
        });
    }
    catch (err) {
        // TODO: report error to the user
        console.error(err);
    }
});
onDestroy(() => {
    if (codeMirrorView) {
        debug('Destroy CodeMirror editor');
        codeMirrorView.destroy();
    }
});
let canUndo = false;
let canRedo = false;
const sortModalId = uniqueId();
const transformModalId = uniqueId();
export function focus() {
    if (codeMirrorView) {
        debug('focus');
        codeMirrorView.focus();
    }
}
// modalOpen is true when one of the modals is open.
// This is used to track whether the editor still has focus
let modalOpen = false;
onDestroy(() => {
    flush();
});
createFocusTracker({
    onMount,
    onDestroy,
    getWindow: () => getWindow(domTextMode),
    hasFocus: () => (modalOpen && document.hasFocus()) || activeElementIsChildOf(domTextMode),
    onFocus,
    onBlur: () => {
        flush();
        onBlur();
    }
});
export function patch(operations) {
    return handlePatch(operations, false);
}
export function handlePatch(operations, emitChange) {
    debug('handlePatch', operations, emitChange);
    const previousJson = parser.parse(text);
    const updatedJson = immutableJSONPatch(previousJson, operations);
    const undo = revertJSONPatch(previousJson, operations);
    const updatedContent = {
        text: parser.stringify(updatedJson, null, indentation)
    };
    setCodeMirrorContent(updatedContent, emitChange, false);
    return {
        json: updatedJson,
        previousJson,
        undo,
        redo: operations
    };
}
function handleFormat() {
    debug('format');
    if (readOnly) {
        return false;
    }
    try {
        const updatedJson = parser.parse(text);
        const updatedContent = {
            text: parser.stringify(updatedJson, null, indentation)
        };
        setCodeMirrorContent(updatedContent, true, false);
        return true;
    }
    catch (err) {
        onError(err);
    }
    return false;
}
function handleCompact() {
    debug('compact');
    if (readOnly) {
        return false;
    }
    try {
        const updatedJson = parser.parse(text);
        const updatedContent = {
            text: parser.stringify(updatedJson)
        };
        setCodeMirrorContent(updatedContent, true, false);
        return true;
    }
    catch (err) {
        onError(err);
    }
    return false;
}
function handleRepair() {
    debug('repair');
    if (readOnly) {
        return;
    }
    try {
        const updatedContent = {
            text: jsonrepair(text)
        };
        setCodeMirrorContent(updatedContent, true, false);
        jsonStatus = JSON_STATUS_VALID;
        jsonParseError = null;
    }
    catch (err) {
        onError(err);
    }
}
function handleSort() {
    if (readOnly) {
        return;
    }
    try {
        const json = parser.parse(text);
        modalOpen = true;
        onSortModal({
            id: sortModalId,
            json,
            rootPath: [],
            onSort: async ({ operations }) => {
                debug('onSort', operations);
                handlePatch(operations, true);
            },
            onClose: () => {
                modalOpen = false;
                focus();
            }
        });
    }
    catch (err) {
        onError(err);
    }
}
/**
 * This method is exposed via JSONEditor.transform
 */
export function openTransformModal({ id, rootPath, onTransform, onClose }) {
    try {
        const json = parser.parse(text);
        modalOpen = true;
        onTransformModal({
            id: id || transformModalId,
            json,
            rootPath: rootPath || [],
            onTransform: (operations) => {
                if (onTransform) {
                    onTransform({
                        operations,
                        json,
                        transformedJson: immutableJSONPatch(json, operations)
                    });
                }
                else {
                    debug('onTransform', operations);
                    handlePatch(operations, true);
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
    catch (err) {
        onError(err);
    }
}
function handleTransform() {
    if (readOnly) {
        return;
    }
    openTransformModal({
        rootPath: []
    });
}
function handleToggleSearch() {
    if (codeMirrorView) {
        // TODO: figure out the proper way to detect whether the search panel is open
        if (codeMirrorRef && codeMirrorRef.querySelector('.cm-search')) {
            closeSearchPanel(codeMirrorView);
        }
        else {
            openSearchPanel(codeMirrorView);
        }
    }
}
function handleUndo() {
    if (readOnly) {
        return;
    }
    if (codeMirrorView) {
        undo(codeMirrorView);
        focus();
    }
}
function handleRedo() {
    if (readOnly) {
        return;
    }
    if (codeMirrorView) {
        redo(codeMirrorView);
        focus();
    }
}
function handleAcceptTooLarge() {
    acceptTooLarge = true;
    setCodeMirrorContent(externalContent, true, true);
}
function handleSwitchToTreeMode() {
    onChangeMode(Mode.tree);
}
function cancelLoadTooLarge() {
    // copy the latest contents of the text editor again into text
    onChangeCodeMirrorValue();
}
function handleSelectValidationError(validationError) {
    debug('select validation error', validationError);
    const { from, to } = toRichValidationError(validationError);
    if (from === null || to === null) {
        return;
    }
    // we take "to" as head, not as anchor, because the scrollIntoView will
    // move to the head, and when a large whole object is selected as a whole,
    // we want to scroll to the start of the object and not the end
    setSelection(from, to);
    focus();
}
function handleSelectParseError(parseError) {
    debug('select parse error', parseError);
    const richParseError = toRichParseError(parseError, false);
    const from = richParseError.from != null ? richParseError.from : 0;
    const to = richParseError.to != null ? richParseError.to : 0;
    // we take "to" as head, not as anchor, because the scrollIntoView will
    // move to the head, and when a large whole object is selected as a whole,
    // we want to scroll to the start of the object and not the end
    setSelection(from, to);
    focus();
}
function setSelection(anchor, head) {
    debug('setSelection', { anchor, head });
    if (codeMirrorView) {
        codeMirrorView.dispatch(codeMirrorView.state.update({
            selection: { anchor, head },
            scrollIntoView: true
        }));
    }
}
function handleDoubleClick(event, view) {
    // When the user double-clicked right from a bracket [ or {,
    // select the contents of the array or object
    if (view.state.selection.ranges.length === 1) {
        const range = view.state.selection.ranges[0];
        const selectedText = text.slice(range.from, range.to);
        if (selectedText === '{' || selectedText === '[') {
            const jsmap = jsonSourceMap.parse(text);
            const path = Object.keys(jsmap.pointers).find((path) => {
                const pointer = jsmap.pointers[path];
                return pointer.value?.pos === range.from;
            });
            const pointer = jsmap.pointers[path];
            if (path && pointer && pointer.value && pointer.valueEnd) {
                debug('pointer found, selecting inner contents of path:', path, pointer);
                const anchor = pointer.value.pos + 1;
                const head = pointer.valueEnd.pos - 1;
                setSelection(anchor, head);
            }
        }
    }
}
function createLinter() {
    return linter(linterCallback, { delay: TEXT_MODE_ONCHANGE_DELAY });
}
function createCodeMirrorView({ target, initialText, readOnly, indentation }) {
    debug('Create CodeMirror editor', { readOnly, indentation });
    const state = EditorState.create({
        doc: initialText,
        selection: toCodeMirrorSelection(externalSelection),
        extensions: [
            keymap.of([indentWithTab, formatCompactKeyBinding]),
            linterCompartment.of(createLinter()),
            lintGutter(),
            lineNumbers(),
            highlightActiveLineGutter(),
            highlightSpecialChars(),
            history(),
            foldGutter(),
            drawSelection(),
            dropCursor(),
            EditorState.allowMultipleSelections.of(true),
            indentOnInput(),
            syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
            bracketMatching(),
            closeBrackets(),
            autocompletion(),
            rectangularSelection(),
            crosshairCursor(),
            highlightActiveLine(),
            highlightSelectionMatches(),
            keymap.of([
                ...closeBracketsKeymap,
                ...defaultKeymap,
                ...searchKeymap,
                ...historyKeymap,
                ...foldKeymap,
                ...completionKeymap,
                ...lintKeymap
            ]),
            highlighter,
            indentationMarkers({ hideFirstIndent: true }),
            EditorView.domEventHandlers({
                dblclick: handleDoubleClick
            }),
            EditorView.updateListener.of((update) => {
                editorState = update.state;
                if (update.docChanged) {
                    onChangeCodeMirrorValueDebounced();
                }
                else if (update.selectionSet) {
                    // note that emitOnSelect is invoked in onChangeCodeMirrorValue too,
                    // right after firing onChange. Hence, the else if here, we do not want to fire it twice.
                    emitOnSelect();
                }
            }),
            jsonLang(),
            search({
                top: true
            }),
            EditorView.lineWrapping,
            readOnlyCompartment.of(EditorState.readOnly.of(readOnly)),
            tabSizeCompartment.of(EditorState.tabSize.of(tabSize)),
            indentCompartment.of(createIndent(indentation)),
            themeCompartment.of(EditorView.theme({}, { dark: hasDarkTheme() }))
        ]
    });
    codeMirrorView = new EditorView({
        state,
        parent: target
    });
    return codeMirrorView;
}
function getCodeMirrorValue() {
    return codeMirrorView ? normalization.unescapeValue(codeMirrorView.state.doc.toString()) : '';
}
function hasDarkTheme() {
    return codeMirrorRef
        ? getComputedStyle(codeMirrorRef).getPropertyValue('--jse-theme').includes('dark')
        : false;
}
function toRichValidationError(validationError) {
    const { path, message, severity } = validationError;
    const { line, column, from, to } = findTextLocation(normalization.escapeValue(text), path);
    return {
        path,
        line,
        column,
        from,
        to,
        message,
        severity,
        actions: []
    };
}
function toRichParseError(parseError, isRepairable) {
    const { line, column, position, message } = parseError;
    return {
        path: [],
        line,
        column,
        from: position,
        to: position,
        severity: ValidationSeverity.error,
        message,
        actions: isRepairable && !readOnly
            ? [
                {
                    name: 'Auto repair',
                    apply: () => handleRepair()
                }
            ]
            : null
    };
}
function toDiagnostic(error) {
    return {
        from: error.from || 0,
        to: error.to || 0,
        message: error.message || '',
        actions: error.actions,
        severity: error.severity
    };
}
function setCodeMirrorContent(newContent, emitChange, forceUpdate) {
    const newText = getText(newContent, indentation, parser);
    const isChanged = !isEqual(newContent, content);
    const previousContent = content;
    debug('setCodeMirrorContent', { isChanged, emitChange, forceUpdate });
    if (!codeMirrorView || (!isChanged && !forceUpdate)) {
        return;
    }
    content = newContent;
    text = newText;
    if (!disableTextEditor(text, acceptTooLarge)) {
        // keep state
        // to reset state: codeMirrorView.setState(EditorState.create({doc: text, extensions: ...}))
        codeMirrorView.dispatch({
            changes: {
                from: 0,
                to: codeMirrorView.state.doc.length,
                insert: normalization.escapeValue(text)
            }
        });
    }
    updateCanUndoRedo();
    if (isChanged && emitChange) {
        emitOnChange(content, previousContent);
    }
}
function applyExternalSelection(externalSelection) {
    if (!isTextSelection(externalSelection)) {
        return;
    }
    const selection = toCodeMirrorSelection(externalSelection);
    if (codeMirrorView && selection && (!editorState || !editorState.selection.eq(selection))) {
        debug('applyExternalSelection', selection);
        // note that we cannot clear the selection (we could maybe set the cursor to 0 but that's not really what we want)
        codeMirrorView.dispatch({ selection });
    }
}
function toCodeMirrorSelection(selection) {
    return isTextSelection(selection) ? EditorSelection.fromJSON(selection) : undefined;
}
/**
 * Force refreshing the editor, for example after changing the font size
 * to update the positioning of the line numbers in the gutter
 */
export async function refresh() {
    debug('refresh');
    // update the theme (light/dark), but also, as a side effect,
    // refresh the font size of the line numbers in the gutter
    await updateTheme();
}
function forceUpdateText() {
    debug('forceUpdateText', { escapeUnicodeCharacters });
    if (codeMirrorView) {
        codeMirrorView.dispatch({
            changes: {
                from: 0,
                to: codeMirrorView.state.doc.length,
                insert: normalization.escapeValue(text)
            }
        });
    }
}
function onChangeCodeMirrorValue() {
    if (onChangeDisabled || !codeMirrorView) {
        return;
    }
    const codeMirrorText = getCodeMirrorValue();
    const isChanged = codeMirrorText !== text;
    debug('onChangeCodeMirrorValue', { isChanged });
    if (!isChanged) {
        return;
    }
    const previousContent = content;
    text = codeMirrorText;
    content = { text };
    updateCanUndoRedo();
    emitOnChange(content, previousContent);
    // We emit OnSelect on the next tick to cater for the case where
    // the user changes the content directly inside the OnChange callback.
    // This change will be dispatched by Svelte on the next tick. Before
    // that tick, emitOnSelect would be fired based on the "old" contents,
    // which may be out of range when the replacement by the user is shorter.
    tick().then(emitOnSelect);
}
function updateLinter(validator) {
    debug('updateLinter', validator);
    if (!codeMirrorView) {
        return;
    }
    codeMirrorView.dispatch({
        effects: linterCompartment.reconfigure(createLinter())
    });
}
function updateIndentation(indentation) {
    if (codeMirrorView) {
        debug('updateIndentation', indentation);
        codeMirrorView.dispatch({
            effects: indentCompartment.reconfigure(createIndent(indentation))
        });
    }
}
function updateTabSize(tabSize) {
    if (codeMirrorView) {
        debug('updateTabSize', tabSize);
        codeMirrorView.dispatch({
            effects: tabSizeCompartment.reconfigure(EditorState.tabSize.of(tabSize))
        });
    }
}
function updateReadOnly(readOnly) {
    if (codeMirrorView) {
        debug('updateReadOnly', readOnly);
        codeMirrorView.dispatch({
            effects: [readOnlyCompartment.reconfigure(EditorState.readOnly.of(readOnly))]
        });
    }
}
async function updateTheme() {
    // we check the theme on the next tick, to make sure the page
    // is re-rendered with (possibly) changed CSS variables
    await tick();
    if (codeMirrorView) {
        const dark = hasDarkTheme();
        debug('updateTheme', { dark });
        codeMirrorView.dispatch({
            effects: [themeCompartment.reconfigure(EditorView.theme({}, { dark }))]
        });
    }
}
function createIndent(indentation) {
    const indent = indentUnit.of(typeof indentation === 'number' ? ' '.repeat(indentation) : indentation);
    // We disable wrappedLineIndent in case of tabs to work around a bug:
    // https://github.com/fauzi9331/codemirror-wrapped-line-indent/issues/2
    return indentation === '\t' ? [indent] : [indent, wrappedLineIndent];
}
function updateCanUndoRedo() {
    canUndo = undoDepth(codeMirrorView.state) > 0;
    canRedo = redoDepth(codeMirrorView.state) > 0;
    debug({ canUndo, canRedo });
}
// debounce the input: when pressing Enter at the end of a line, two change
// events are fired: one with the new Return character, and a second with
// indentation added on the new line. This causes a race condition when used
// for example in React. Debouncing the onChange events also results in not
// firing a change event with every character that a user types, but only as
// soon as the user stops typing.
const onChangeCodeMirrorValueDebounced = debounce(onChangeCodeMirrorValue, TEXT_MODE_ONCHANGE_DELAY);
function flush() {
    onChangeCodeMirrorValueDebounced.flush();
}
function emitOnChange(content, previousContent) {
    if (onChange) {
        onChange(content, previousContent, {
            contentErrors: validate(),
            patchResult: null
        });
    }
}
function emitOnSelect() {
    onSelect({
        type: SelectionType.text,
        ...editorState.selection.toJSON()
    });
}
function disableTextEditor(text, acceptTooLarge) {
    const tooLarge = text ? text.length > MAX_DOCUMENT_SIZE_TEXT_MODE : false;
    return tooLarge && !acceptTooLarge;
}
let jsonStatus = JSON_STATUS_VALID;
let jsonParseError = null;
function linterCallback() {
    if (disableTextEditor(text, acceptTooLarge)) {
        return [];
    }
    const contentErrors = validate();
    if (isContentParseError(contentErrors)) {
        const { parseError, isRepairable } = contentErrors;
        return [toDiagnostic(toRichParseError(parseError, isRepairable))];
    }
    if (isContentValidationErrors(contentErrors)) {
        return contentErrors.validationErrors.map(toRichValidationError).map(toDiagnostic);
    }
    return [];
}
export function validate() {
    debug('validate:start');
    flush();
    const contentErrors = memoizedValidateText(normalization.escapeValue(text), validator, parser, validationParser);
    if (isContentParseError(contentErrors)) {
        jsonStatus = contentErrors.isRepairable ? JSON_STATUS_REPAIRABLE : JSON_STATUS_INVALID;
        jsonParseError = contentErrors.parseError;
        validationErrors = [];
    }
    else {
        jsonStatus = JSON_STATUS_VALID;
        jsonParseError = null;
        validationErrors = contentErrors?.validationErrors || [];
    }
    debug('validate:end');
    return contentErrors;
}
// because onChange returns the validation errors and there is also a separate listener,
// we would execute validation twice. Memoizing the last result solves this.
const memoizedValidateText = memoizeOne(validateText);
function handleShowMe() {
    if (jsonParseError) {
        handleSelectParseError(jsonParseError);
    }
}
const repairActionShowMe = {
    icon: faEye,
    text: 'Show me',
    title: 'Move to the parse error location',
    onClick: handleShowMe
};
$: repairActions =
    jsonStatus === JSON_STATUS_REPAIRABLE && !readOnly
        ? [
            {
                icon: faWrench,
                text: 'Auto repair',
                title: 'Automatically repair JSON',
                onClick: handleRepair
            },
            repairActionShowMe
        ]
        : [repairActionShowMe];
</script>

<div class="jse-text-mode" class:no-main-menu={!mainMenuBar} bind:this={domTextMode}>
  {#if mainMenuBar}
    {@const isNewDocument = text.length === 0}

    <TextMenu
      {readOnly}
      onFormat={handleFormat}
      onCompact={handleCompact}
      onSort={handleSort}
      onTransform={handleTransform}
      onToggleSearch={handleToggleSearch}
      onUndo={handleUndo}
      onRedo={handleRedo}
      canFormat={!isNewDocument}
      canCompact={!isNewDocument}
      canSort={!isNewDocument}
      canTransform={!isNewDocument}
      {canUndo}
      {canRedo}
      {onRenderMenu}
    />
  {/if}

  {#if !isSSR}
    {@const editorDisabled = disableTextEditor(text, acceptTooLarge)}

    <div class="jse-contents" class:jse-hidden={editorDisabled} bind:this={codeMirrorRef} />

    {#if editorDisabled}
      <Message
        icon={faExclamationTriangle}
        type="error"
        message={`The JSON document is larger than ${formatSize(
          MAX_DOCUMENT_SIZE_TEXT_MODE,
          1024
        )}, ` +
          `and may crash your browser when loading it in text mode. Actual size: ${formatSize(
            text.length,
            1024
          )}.`}
        actions={[
          {
            text: 'Open anyway',
            title: 'Open the document in text mode. This may freeze or crash your browser.',
            onClick: handleAcceptTooLarge
          },
          {
            text: 'Open in tree mode',
            title: 'Open the document in tree mode. Tree mode can handle large documents.',
            onClick: handleSwitchToTreeMode
          },
          {
            text: 'Cancel',
            title: 'Cancel opening this large document.',
            onClick: cancelLoadTooLarge
          }
        ]}
        onClose={focus}
      />

      <div class="jse-contents jse-preview">
        {truncate(text || '', MAX_CHARACTERS_TEXT_PREVIEW)}
      </div>
    {/if}

    {#if !editorDisabled}
      {#if statusBar}
        <StatusBar {editorState} />
      {/if}

      {#if jsonParseError}
        <Message
          type="error"
          icon={faExclamationTriangle}
          message={jsonParseError.message}
          actions={repairActions}
          onClick={handleShowMe}
          onClose={focus}
        />
      {/if}

      {#if !jsonParseError && askToFormat && needsFormatting(text)}
        <Message
          type="success"
          message="Do you want to format the JSON?"
          actions={[
            {
              icon: faJSONEditorFormat,
              text: 'Format',
              title: 'Format JSON: add proper indentation and new lines (Ctrl+I)',
              onClick: handleFormat
            },
            {
              icon: faTimes,
              text: 'No thanks',
              title: 'Close this message',
              onClick: () => (askToFormat = false)
            }
          ]}
          onClose={focus}
        />
      {/if}

      <ValidationErrorsOverview {validationErrors} selectError={handleSelectValidationError} />
    {/if}
  {:else}
    <div class="jse-contents">
      <div class="jse-loading-space" />
      <div class="jse-loading">loading...</div>
    </div>
  {/if}
</div>

<style src="./TextMode.scss">/* over all fonts, sizes, and colors */
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
.jse-text-mode {
  --internal-key-color: var(--jse-key-color, #1a1a1a);
  --internal-value-color-number: var(--jse-value-color-number, #ee422e);
  --internal-value-color-boolean: var(--jse-value-color-boolean, #ff8c00);
  --internal-value-color-string: var(--jse-value-color-string, #008000);
  --internal-value-color-null: var(--jse-value-color-null, #004ed0);
  flex: 1;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: var(--jse-background-color, #fff);
}
.jse-text-mode.no-main-menu {
  border-top: var(--jse-main-border, 1px solid #d7d7d7);
}
.jse-text-mode .jse-contents {
  flex: 1;
  display: flex;
  position: relative;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  min-height: 0;
  border-left: var(--jse-main-border, 1px solid #d7d7d7);
  border-right: var(--jse-main-border, 1px solid #d7d7d7);
}
.jse-text-mode .jse-contents:last-child {
  border-bottom: var(--jse-main-border, 1px solid #d7d7d7);
}
.jse-text-mode .jse-contents.jse-hidden {
  visibility: hidden;
  position: absolute;
  top: 0;
  left: 0;
}
.jse-text-mode .jse-contents :global(.cm-editor) {
  flex: 1;
  overflow: hidden;
}
.jse-text-mode .jse-contents :global(.cm-editor) :global(.cm-scroller) {
  font-family: var(--jse-font-family-mono, consolas, menlo, monaco, "Ubuntu Mono", "source-code-pro", monospace);
  font-size: var(--jse-font-size-mono, 14px);
  line-height: var(--jse-line-height, calc(1em + 4px));
  color: var(--jse-delimiter-color, rgba(0, 0, 0, 0.38));
}
.jse-text-mode .jse-contents :global(.cm-editor) :global(.cm-gutters) {
  background: var(--jse-panel-background, #ebebeb);
  color: var(--jse-panel-color-readonly, #b2b2b2);
  border-right: var(--jse-panel-border, var(--jse-main-border, 1px solid #d7d7d7));
}
.jse-text-mode .jse-contents :global(.cm-editor) :global(.cm-activeLine),
.jse-text-mode .jse-contents :global(.cm-editor) :global(.cm-activeLineGutter) {
  background: var(--jse-active-line-background-color, rgba(0, 0, 0, 0.06));
}
.jse-text-mode .jse-contents :global(.cm-editor) :global(.cm-selectionBackground) {
  background: var(--jse-selection-background-color, #d3d3d3);
}
.jse-text-mode .jse-contents :global(.cm-editor) :global(.cm-searchMatch) {
  background-color: var(--jse-search-match-color, #ffe665);
  outline: var(--jse-search-match-outline, 1px solid #ffd700);
}
.jse-text-mode .jse-contents :global(.cm-editor) :global(.cm-searchMatch.cm-searchMatch-selected) {
  background-color: var(--jse-search-match-active-color, #ffd700);
  outline: var(--jse-search-match-active-outline, 1px solid #e1be00);
}
.jse-text-mode .jse-contents :global(.cm-editor) :global(.cm-selectionMatch) {
  background-color: var(--jse-search-match-background-color, rgba(153, 255, 119, 0.5019607843));
}
.jse-text-mode .jse-contents :global(.cm-editor) :global(.cm-foldPlaceholder) {
  background: var(--jse-tag-background, rgba(0, 0, 0, 0.2));
  color: var(--jse-tag-color, var(--jse-text-color-inverse, #fff));
  border: none;
  padding: 0 var(--jse-padding, 10px);
}
.jse-text-mode .jse-contents :global(.cm-editor) :global(.cm-tooltip) {
  font-size: var(--jse-font-size, 16px);
  font-family: var(--jse-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif);
  color: var(--jse-tooltip-color, var(--jse-text-color, #4d4d4d));
  background: var(--jse-tooltip-background, var(--jse-modal-background, #f5f5f5));
  border: var(--jse-tooltip-border, var(--jse-main-border, 1px solid #d7d7d7));
}
.jse-text-mode .jse-contents :global(.cm-editor) :global(.cm-diagnosticAction) {
  background: var(--jse-tooltip-action-button-color, var(--jse-text-color-inverse, #fff));
  background: var(--jse-tooltip-action-button-background, #4d4d4d);
}
.jse-text-mode .jse-contents :global(.cm-editor) :global(.cm-panels) {
  border-bottom: var(--jse-panel-border, var(--jse-main-border, 1px solid #d7d7d7));
}
.jse-text-mode .jse-contents :global(.cm-editor) :global(.cm-search) {
  background: var(--jse-panel-background, #ebebeb);
  color: var(--jse-panel-color, var(--jse-text-color, #4d4d4d));
  font-family: var(--jse-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif);
  font-size: var(--jse-font-size, 16px);
}
.jse-text-mode .jse-contents :global(.cm-editor) :global(.cm-search input) {
  font-family: var(--jse-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif);
  font-size: var(--jse-font-size-text-mode-search, 80%);
  color: var(--jse-input-color, var(--jse-text-color, #4d4d4d));
  border: var(--jse-input-border, 1px solid #d8dbdf);
  background: var(--jse-input-background, var(--jse-background-color, #fff));
  margin-right: 2px;
}
.jse-text-mode .jse-contents :global(.cm-editor) :global(.cm-search button) {
  font-family: var(--jse-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif);
  font-size: var(--jse-font-size-text-mode-search, 80%);
  color: var(--jse-panel-button-color, inherit);
  background: var(--jse-panel-button-background, transparent);
  border: none;
  cursor: pointer;
  text-transform: capitalize;
  padding: calc(0.5 * var(--jse-padding, 10px)) var(--jse-padding, 10px);
  margin: 0;
}
.jse-text-mode .jse-contents :global(.cm-editor) :global(.cm-search button):hover {
  color: var(--panel-button-color-highlight, var(--jse-text-color, #4d4d4d));
  background: var(--jse-panel-button-background-highlight, #e0e0e0);
}
.jse-text-mode .jse-contents :global(.cm-editor) :global(.cm-search label) {
  font-family: var(--jse-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif);
  font-size: var(--jse-font-size-text-mode-search, 80%);
  padding-left: var(--jse-padding, 10px);
}
.jse-text-mode .jse-contents :global(.cm-editor) :global(.cm-search label input) {
  margin-right: 2px;
}
.jse-text-mode .jse-contents :global(.cm-editor) :global(.cm-search button[name="close"]) {
  width: 32px;
  height: 32px;
  font-size: 24px;
  line-height: 24px;
  padding: 0;
  right: 0;
  top: -4px;
}
.jse-text-mode .jse-contents :global(.cm-editor) :global(.cm-cursor-primary) {
  border-color: var(--jse-text-color, #4d4d4d);
}
.jse-text-mode .jse-contents .jse-loading-space {
  flex: 1;
}
.jse-text-mode .jse-contents .jse-loading {
  flex: 2;
  text-align: center;
  color: var(--jse-panel-color-readonly, #b2b2b2);
  box-sizing: border-box;
  font-family: var(--jse-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif);
  font-size: var(--jse-font-size, 16px);
}
.jse-text-mode .jse-contents.jse-preview {
  flex: 1;
  font-family: var(--jse-font-family-mono, consolas, menlo, monaco, "Ubuntu Mono", "source-code-pro", monospace);
  font-size: var(--jse-font-size-mono, 14px);
  color: var(--jse-panel-color-readonly, #b2b2b2);
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
  padding: 2px;
}</style>
