<svelte:options immutable={true} />

<script>import { getContext, tick } from 'svelte';
import Header from './Header.svelte';
import { compileJSONPointer, immutableJSONPatch, isJSONArray } from 'immutable-json-patch';
import { createDebug } from '../../utils/debug.js';
import { Mode } from '../../types.js';
import JSONEditorRoot from '../modes/JSONEditorRoot.svelte';
import { noop } from '../../utils/noop.js';
import { stringifyJSONPath } from '../../utils/pathUtils.js';
import { initial, isEmpty, last } from 'lodash-es';
import { isJSONContent, toJSONContent } from '../../utils/jsonUtils.js';
import Icon from 'svelte-awesome';
import { faCaretLeft } from '@fortawesome/free-solid-svg-icons';
import memoizeOne from 'memoize-one';
import { onEscape } from '../../actions/onEscape.js';
import { getFocusPath, isJSONSelection } from '../../logic/selection.js';
const debug = createDebug('jsoneditor:JSONEditorModal');
export let content; // the nested document
export let path;
export let onPatch;
export let readOnly;
export let indentation;
export let tabSize;
export let mainMenuBar;
export let navigationBar;
export let statusBar;
export let askToFormat;
export let escapeControlCharacters;
export let escapeUnicodeCharacters;
export let flattenColumns;
export let parser;
export let validator;
export let validationParser;
export let pathParser;
export let onRenderValue;
export let onClassName;
export let onRenderMenu;
export let onRenderContextMenu;
export let onSortModal;
export let onTransformModal;
const { close } = getContext('simple-modal');
let refEditor;
let fullscreen;
const rootState = {
    mode: determineMode(content),
    content,
    selection: null,
    relativePath: path
};
let stack = [rootState];
$: currentState = last(stack) || rootState;
$: absolutePath = stack.flatMap((state) => state.relativePath);
$: pathDescription = !isEmpty(absolutePath) ? stringifyJSONPath(absolutePath) : '(document root)';
// not relevant in this Modal setting, but well
$: parseMemoizeOne = memoizeOne(parser.parse);
let error = undefined;
function determineMode(content) {
    return isJSONContent(content) && isJSONArray(content.json) ? Mode.table : Mode.tree;
}
function scrollToSelection() {
    const selection = last(stack)?.selection || null;
    if (isJSONSelection(selection)) {
        refEditor.scrollTo(getFocusPath(selection));
    }
}
function handleApply() {
    debug('handleApply');
    if (readOnly) {
        return;
    }
    try {
        error = undefined;
        const path = currentState.relativePath;
        const content = currentState.content;
        const operations = [
            {
                op: 'replace',
                path: compileJSONPointer(path),
                value: toJSONContent(content, parser).json // this can throw an error
            }
        ];
        if (stack.length > 1) {
            const parentContent = stack[stack.length - 2].content;
            const parentJson = toJSONContent(parentContent, parser).json;
            const updatedParentContent = {
                json: immutableJSONPatch(parentJson, operations)
            };
            // after successfully updated, remove from the stack and apply the change to the parent
            const parentState = stack[stack.length - 2] || rootState;
            const updatedParentState = { ...parentState, content: updatedParentContent };
            stack = [...stack.slice(0, stack.length - 2), updatedParentState];
            tick().then(scrollToSelection);
        }
        else {
            onPatch(operations);
            close();
        }
    }
    catch (err) {
        error = String(err);
    }
}
function handleClose() {
    debug('handleClose');
    if (stack.length > 1) {
        // remove the last item from the stack
        stack = initial(stack);
        tick().then(scrollToSelection);
        // clear any error from the just closed state
        error = undefined;
    }
    else {
        // this is the first modal, the root state, close the modal
        close();
    }
}
function handleEscape() {
    if (fullscreen) {
        fullscreen = false;
    }
    else {
        handleClose();
    }
}
function handleChange(updatedContent) {
    debug('handleChange', updatedContent);
    const updatedState = {
        ...currentState,
        content: updatedContent
    };
    stack = [...initial(stack), updatedState];
}
function handleChangeSelection(newSelection) {
    debug('handleChangeSelection', newSelection);
    const updatedState = {
        ...currentState,
        selection: newSelection
    };
    stack = [...initial(stack), updatedState];
}
function handleChangeMode(newMode) {
    debug('handleChangeMode', newMode);
    const updatedState = {
        ...currentState,
        mode: newMode
    };
    stack = [...initial(stack), updatedState];
}
function handleError(newError) {
    error = newError.toString();
    console.error(newError);
}
function handleJSONEditorModal({ content, path }) {
    debug('handleJSONEditorModal', { content, path });
    const nestedModalState = {
        mode: determineMode(content),
        content,
        selection: null,
        relativePath: path
    };
    stack = [...stack, nestedModalState];
}
function focus(element) {
    element.focus();
}
</script>

<div class="jse-modal jse-jsoneditor-modal" class:fullscreen use:onEscape={handleEscape}>
  <Header
    title="Edit nested content {stack.length > 1 ? ` (${stack.length})` : ''}"
    fullScreenButton={true}
    bind:fullscreen
    onClose={handleClose}
  />

  <div class="jse-modal-contents">
    <div class="jse-label">
      <div class="jse-label-inner">Path</div>
    </div>
    <input class="jse-path" type="text" readonly title="Selected path" value={pathDescription} />

    <div class="jse-label">
      <div class="jse-label-inner">Contents</div>
    </div>

    <div class="jse-modal-inline-editor">
      <JSONEditorRoot
        bind:this={refEditor}
        mode={currentState.mode}
        content={currentState.content}
        selection={currentState.selection}
        {readOnly}
        {indentation}
        {tabSize}
        {statusBar}
        {askToFormat}
        {mainMenuBar}
        {navigationBar}
        {escapeControlCharacters}
        {escapeUnicodeCharacters}
        {flattenColumns}
        {parser}
        {parseMemoizeOne}
        {validator}
        {validationParser}
        {pathParser}
        insideModal={true}
        onError={handleError}
        onChange={handleChange}
        onChangeMode={handleChangeMode}
        onSelect={handleChangeSelection}
        {onRenderValue}
        {onClassName}
        onFocus={noop}
        onBlur={noop}
        {onRenderMenu}
        {onRenderContextMenu}
        {onSortModal}
        {onTransformModal}
        onJSONEditorModal={handleJSONEditorModal}
      />
    </div>

    <div class="jse-actions">
      {#if error}
        <div class="jse-error">
          {error}
        </div>
      {/if}

      {#if stack.length > 1}
        <button type="button" class="jse-secondary" on:click={handleClose}>
          <Icon data={faCaretLeft} /> Back
        </button>
      {/if}
      {#if !readOnly}
        <button type="button" class="jse-primary" on:click={handleApply} use:focus> Apply </button>
      {:else}
        <button type="button" class="jse-primary" on:click={handleClose} use:focus> Close </button>
      {/if}
    </div>
  </div>
</div>

<style src="./JSONEditorModal.scss">/* over all fonts, sizes, and colors */
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
/* over all fonts, sizes, and colors */
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
.jse-modal {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  font-family: var(--jse-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif);
  font-size: var(--jse-font-size, 16px);
  line-height: normal;
  background: var(--jse-modal-background, #f5f5f5);
  color: var(--jse-text-color, #4d4d4d);
}
.jse-modal :global(.svelte-select) {
  --border: var(--jse-svelte-select-border, 1px solid #d8dbdf);
  --item-is-active-bg: var(--jse-item-is-active-bg, #3883fa);
  --border-radius: var(--jse-svelte-select-border-radius, 3px);
  --background: var(--jse-svelte-select-background, #fff);
  --padding: var(--jse-svelte-select-padding, 0 10px);
  --multi-select-padding: var(--jse-svelte-select-multi-select-padding, 0 10px);
  --font-size: var(--jse-svelte-select-font-size, var(--jse-font-size, 16px));
  --height: 36px;
  --multi-item-height: 28px;
  --multi-item-margin: 2px;
  --multi-item-padding: 2px 8px;
  --multi-item-border-radius: 6px;
  --indicator-top: 8px;
}
.jse-modal .jse-modal-contents {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow: auto;
  min-width: 0;
  min-height: 0;
}
.jse-modal .jse-modal-contents .jse-actions {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding-top: var(--jse-padding, 10px);
}
.jse-modal .jse-modal-contents .jse-actions button.jse-primary {
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-family: var(--jse-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif);
  font-size: var(--jse-font-size, 16px);
  padding: 5px;
  margin: 0;
  background: var(--jse-button-primary-background, var(--jse-theme-color, #3883fa));
  color: var(--jse-button-primary-color, #fff);
  padding: var(--jse-padding, 10px) calc(2 * var(--jse-padding, 10px));
  border-radius: 3px;
}
.jse-modal .jse-modal-contents .jse-actions button.jse-primary:hover {
  background: var(--jse-button-primary-background-highlight, var(--jse-theme-color-highlight, #5f9dff));
}
.jse-modal .jse-modal-contents .jse-actions button.jse-primary:disabled {
  background: var(--jse-button-primary-background-disabled, #9d9d9d);
}

:global(.bg.jse-modal-bg) {
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: var(--jse-overlay-background, rgba(0, 0, 0, 0.3));
}

:global(.bg.jse-modal-bg .jse-modal-window-wrap) {
  margin: 0;
  overflow: auto;
}

:global(.bg.jse-modal-bg .jse-modal-window) {
  max-width: 90%;
  margin: 4rem auto 2rem auto;
  border-radius: 2px;
}

:global(.bg.jse-modal-bg .jse-modal-window.jse-modal-window-sort) {
  width: 400px;
}

:global(.bg.jse-modal-bg .jse-modal-window.jse-modal-window-transform) {
  width: 1200px;
  height: 1200px;
  max-height: 80%;
  display: flex;
}

:global(.bg.jse-modal-bg .jse-modal-window.jse-modal-window-jsoneditor) {
  width: 800px;
  max-height: 500px;
  display: flex;
}

:global(.bg.jse-modal-bg .jse-modal-window:has(div.fullscreen)) {
  margin: var(--jse-padding, 10px);
  padding: 0;
  width: calc(100vw - 2 * var(--jse-padding, 10px));
  height: calc(100vh - 2 * var(--jse-padding, 10px));
  max-width: none;
  max-height: none;
}

:global(.bg.jse-modal-bg .jse-modal-container) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  max-height: none;
}

.jse-modal.jse-jsoneditor-modal .jse-modal-contents {
  padding-top: 0;
}
.jse-modal.jse-jsoneditor-modal .jse-modal-contents .jse-label {
  font-weight: bold;
  display: block;
  box-sizing: border-box;
}
.jse-modal.jse-jsoneditor-modal .jse-modal-contents .jse-label .jse-label-inner {
  margin-top: calc(2 * var(--jse-padding, 10px));
  margin-bottom: calc(0.5 * var(--jse-padding, 10px));
  box-sizing: border-box;
}
.jse-modal.jse-jsoneditor-modal .jse-modal-contents .jse-label .jse-label-inner button {
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-family: var(--jse-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif);
  font-size: var(--jse-font-size, 16px);
  padding: 5px;
  margin: 0;
  font-weight: bold;
  padding: 0;
}
.jse-modal.jse-jsoneditor-modal .jse-modal-contents .jse-modal-inline-editor {
  flex: 1;
  min-height: 150px;
  min-width: 0;
  display: flex;
  --jse-theme-color: var(--jse-modal-editor-theme-color, var(--jse-modal-theme-color, #707070));
  --jse-theme-color-highlight: var(--jse-modal-editor-theme-color-highlight, var(--jse-modal-theme-color-highlight, #646464));
}
.jse-modal.jse-jsoneditor-modal .jse-actions {
  gap: var(--jse-padding, 10px);
  align-items: center;
}
.jse-modal.jse-jsoneditor-modal .jse-actions .jse-error {
  flex: 1;
  color: var(--jse-error-color, #ee5341);
}
.jse-modal.jse-jsoneditor-modal .jse-actions button.jse-secondary {
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-family: var(--jse-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif);
  font-size: var(--jse-font-size, 16px);
  padding: 5px;
  margin: 0;
  background: var(--jse-button-secondary-background, #d3d3d3);
  color: var(--jse-button-secondary-color, var(--jse-text-color, #4d4d4d));
  padding: var(--jse-padding, 10px) calc(2 * var(--jse-padding, 10px));
  border-radius: 3px;
}
.jse-modal.jse-jsoneditor-modal .jse-actions button.jse-secondary:hover {
  background: var(--jse-button-secondary-background-highlight, #e1e1e1);
}
.jse-modal.jse-jsoneditor-modal .jse-actions button.jse-secondary:disabled {
  background: var(--jse-button-secondary-background-disabled, #9d9d9d);
}
.jse-modal.jse-jsoneditor-modal input {
  border: var(--jse-input-border, 1px solid #d8dbdf);
  outline: none;
  box-sizing: border-box;
  padding: calc(0.5 * var(--jse-padding, 10px));
  font-family: var(--jse-font-family-mono, consolas, menlo, monaco, "Ubuntu Mono", "source-code-pro", monospace);
  font-size: var(--jse-font-size-mono, 14px);
  color: inherit;
  background: var(--jse-input-background, var(--jse-background-color, #fff));
}
.jse-modal.jse-jsoneditor-modal input:focus {
  border: var(--jse-input-border-focus, 1px solid var(--jse-input-border-focus, var(--jse-theme-color, #3883fa)));
}
.jse-modal.jse-jsoneditor-modal input:read-only {
  background: var(--jse-input-background-readonly, transparent);
}</style>
