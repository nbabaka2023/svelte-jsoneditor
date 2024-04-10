<svelte:options immutable={true} />

<script>import { uniqueId } from '../../utils/uniqueId.js';
import { faCaretDown, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { debounce, isEmpty, noop } from 'lodash-es';
import { getContext } from 'svelte';
import Icon from 'svelte-awesome';
import { DEBOUNCE_DELAY } from '../../constants.js';
import { compileJSONPointer, getIn } from 'immutable-json-patch';
import { stringifyJSONPath } from '../../utils/pathUtils.js';
import { transformModalStates, transformModalStateShared } from './transformModalStates.js';
import TransformWizard from './TransformWizard.svelte';
import TransformModalHeader from './TransformModalHeader.svelte';
import AbsolutePopup from './popup/AbsolutePopup.svelte';
import { createDebug } from '../../utils/debug.js';
import TreeMode from '../modes/treemode/TreeMode.svelte';
import { onEscape } from '../../actions/onEscape.js';
import { readonlyProxy } from '../../utils/readonlyProxy.js';
const debug = createDebug('jsoneditor:TransformModal');
export let id = 'transform-modal-' + uniqueId();
export let json;
export let rootPath = [];
export let indentation;
export let escapeControlCharacters;
export let escapeUnicodeCharacters;
export let parser;
export let parseMemoizeOne;
export let validationParser;
export let pathParser;
export let queryLanguages;
export let queryLanguageId;
export let onChangeQueryLanguage;
export let onRenderValue;
export let onRenderMenu;
export let onRenderContextMenu;
export let onClassName;
export let onTransform;
let selectedJson;
$: selectedJson = readonlyProxy(getIn(json, rootPath));
let selectedContent;
$: selectedContent = selectedJson ? { json: selectedJson } : { text: '' };
const { close } = getContext('simple-modal');
let fullscreen = false;
const stateId = `${id}:${compileJSONPointer(rootPath)}`;
const state = transformModalStates[stateId] || {};
// showWizard is not stored inside a stateId
let showWizard = transformModalStateShared.showWizard !== false;
let showOriginal = transformModalStateShared.showOriginal !== false;
let queryOptions = state.queryOptions || {};
let query = queryLanguageId === state.queryLanguageId && state.query
    ? state.query
    : getSelectedQueryLanguage(queryLanguageId).createQuery(selectedJson, state.queryOptions || {});
let isManual = state.isManual || false;
let previewError = undefined;
let previewContent = { text: '' };
function getSelectedQueryLanguage(queryLanguageId) {
    return queryLanguages.find((item) => item.id === queryLanguageId) || queryLanguages[0];
}
function updateQueryByWizard(newQueryOptions) {
    queryOptions = newQueryOptions;
    query = getSelectedQueryLanguage(queryLanguageId).createQuery(selectedJson, newQueryOptions);
    isManual = false;
    debug('updateQueryByWizard', { queryOptions, query, isManual });
}
function handleChangeQuery(event) {
    query = event.target.value;
    isManual = true;
    debug('handleChangeQuery', { query, isManual });
}
function previewTransform(previewJson, query) {
    if (previewJson === undefined) {
        previewContent = { text: '' };
        previewError = 'Error: No JSON';
        return;
    }
    try {
        debug('previewTransform', {
            query
        });
        const jsonTransformed = getSelectedQueryLanguage(queryLanguageId).executeQuery(previewJson, query, parser);
        previewContent = { json: jsonTransformed };
        previewError = undefined;
    }
    catch (err) {
        previewContent = { text: '' };
        previewError = String(err);
    }
}
const previewTransformDebounced = debounce(previewTransform, DEBOUNCE_DELAY);
$: {
    previewTransformDebounced(selectedJson, query);
}
$: {
    // remember the selected values for the next time we open the SortModal
    // just in memory, not persisted
    transformModalStates[stateId] = {
        queryOptions,
        query,
        queryLanguageId,
        isManual
    };
    debug('store state in memory', stateId, transformModalStates[stateId]);
}
function handleTransform() {
    if (selectedJson === undefined) {
        previewContent = { text: '' };
        previewError = 'Error: No JSON';
        return;
    }
    try {
        debug('handleTransform', { query });
        const jsonTransformed = getSelectedQueryLanguage(queryLanguageId).executeQuery(selectedJson, query, parser);
        onTransform([
            {
                op: 'replace',
                path: compileJSONPointer(rootPath),
                value: jsonTransformed
            }
        ]);
        close();
    }
    catch (err) {
        // this should never occur since we can only press the Transform
        // button when creating a preview was successful
        console.error(err);
        previewContent = { text: '' };
        previewError = String(err);
    }
}
function toggleShowWizard() {
    showWizard = !showWizard;
    // not stored inside a stateId
    transformModalStateShared.showWizard = showWizard;
}
function toggleShowOriginal() {
    showOriginal = !showOriginal;
    // not stored inside a stateId
    transformModalStateShared.showOriginal = showOriginal;
}
function focus(element) {
    element.focus();
}
function handleChangeQueryLanguage(newQueryLanguageId) {
    debug('handleChangeQueryLanguage', newQueryLanguageId);
    queryLanguageId = newQueryLanguageId;
    onChangeQueryLanguage(newQueryLanguageId);
    const newSelectedQueryLanguage = getSelectedQueryLanguage(queryLanguageId);
    query = newSelectedQueryLanguage.createQuery(selectedJson, queryOptions);
    isManual = false;
}
function handleEscape() {
    if (fullscreen) {
        fullscreen = !fullscreen;
    }
    else {
        close();
    }
}
</script>

<div class="jse-modal jse-transform" class:fullscreen use:onEscape={handleEscape}>
  <AbsolutePopup>
    <TransformModalHeader
      {queryLanguages}
      {queryLanguageId}
      onChangeQueryLanguage={handleChangeQueryLanguage}
      bind:fullscreen
    />
    <div class="jse-modal-contents">
      <div class="jse-main-contents">
        <div class="jse-query-contents">
          <div class="jse-label">
            <div class="jse-label-inner">Language</div>
          </div>
          <div class="jse-description">
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html getSelectedQueryLanguage(queryLanguageId).description}
          </div>

          <div class="jse-label">
            <div class="jse-label-inner">Path</div>
          </div>
          <input
            class="jse-path"
            type="text"
            readonly
            title="Selected path"
            value={!isEmpty(rootPath) ? stringifyJSONPath(rootPath) : '(document root)'}
          />

          <div class="jse-label">
            <div class="jse-label-inner">
              <button type="button" on:click={toggleShowWizard}>
                <Icon data={showWizard ? faCaretDown : faCaretRight} />
                Wizard
              </button>
            </div>
          </div>
          {#if showWizard}
            {#if Array.isArray(selectedJson)}
              <TransformWizard {queryOptions} json={selectedJson} onChange={updateQueryByWizard} />
            {:else}
              (Only available for arrays, not for objects)
            {/if}
          {/if}

          <div class="jse-label">
            <div class="jse-label-inner">Query</div>
          </div>
          <textarea class="jse-query" spellcheck="false" on:input={handleChangeQuery}
            >{query}</textarea
          >
        </div>
        <div class="jse-data-contents" class:jse-hide-original-data={!showOriginal}>
          <div class="jse-original-data" class:jse-hide={!showOriginal}>
            <div class="jse-label">
              <div class="jse-label-inner">
                <button type="button" on:click={toggleShowOriginal}>
                  <Icon data={showOriginal ? faCaretDown : faCaretRight} />
                  Original
                </button>
              </div>
            </div>
            {#if showOriginal}
              <TreeMode
                externalContent={selectedContent}
                externalSelection={null}
                readOnly={true}
                mainMenuBar={false}
                navigationBar={false}
                {indentation}
                {escapeControlCharacters}
                {escapeUnicodeCharacters}
                {parser}
                {parseMemoizeOne}
                {onRenderValue}
                {onRenderMenu}
                {onRenderContextMenu}
                onError={console.error}
                onChange={noop}
                onChangeMode={noop}
                onSelect={noop}
                onFocus={noop}
                onBlur={noop}
                onSortModal={noop}
                onTransformModal={noop}
                onJSONEditorModal={noop}
                {onClassName}
                validator={null}
                {validationParser}
                {pathParser}
              />
            {/if}
          </div>
          <div class="jse-preview-data">
            <div class="jse-label">
              <div class="jse-label-inner">Preview</div>
            </div>
            {#if !previewError}
              <TreeMode
                externalContent={previewContent}
                externalSelection={null}
                readOnly={true}
                mainMenuBar={false}
                navigationBar={false}
                {indentation}
                {escapeControlCharacters}
                {escapeUnicodeCharacters}
                {parser}
                {parseMemoizeOne}
                {onRenderValue}
                {onRenderMenu}
                {onRenderContextMenu}
                onError={console.error}
                onChange={noop}
                onChangeMode={noop}
                onSelect={noop}
                onFocus={noop}
                onBlur={noop}
                onSortModal={noop}
                onTransformModal={noop}
                onJSONEditorModal={noop}
                {onClassName}
                validator={null}
                {validationParser}
                {pathParser}
              />
            {:else}
              <div class="jse-preview jse-error">
                {previewError}
              </div>
            {/if}
          </div>
        </div>
      </div>

      <div class="jse-actions">
        <button
          type="button"
          class="jse-primary"
          on:click={handleTransform}
          use:focus
          disabled={!!previewError}
        >
          Transform
        </button>
      </div>
    </div>
  </AbsolutePopup>
</div>

<style src="./TransformModal.scss">/* over all fonts, sizes, and colors */
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

.jse-modal.jse-transform .jse-modal-contents {
  color: inherit;
  min-height: 0;
  padding: 0;
}
.jse-modal.jse-transform .jse-modal-contents .jse-main-contents {
  flex: 1;
  display: flex;
  gap: calc(2 * var(--jse-padding, 10px));
  min-height: 0;
  box-sizing: border-box;
  padding: 0 calc(2 * var(--jse-padding, 10px)) var(--jse-padding, 10px);
}
.jse-modal.jse-transform .jse-modal-contents .jse-main-contents .jse-query-contents {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.jse-modal.jse-transform .jse-modal-contents .jse-main-contents .jse-query-contents .jse-description :global(p) {
  margin: var(--jse-padding, 10px) 0;
}
.jse-modal.jse-transform .jse-modal-contents .jse-main-contents .jse-query-contents .jse-description :global(p):first-child {
  margin-top: 0;
}
.jse-modal.jse-transform .jse-modal-contents .jse-main-contents .jse-query-contents .jse-description :global(p):last-child {
  margin-bottom: 0;
}
.jse-modal.jse-transform .jse-modal-contents .jse-main-contents .jse-query-contents .jse-description :global(code) {
  background: var(--jse-modal-code-background, rgba(0, 0, 0, 0.05));
  font-family: var(--jse-font-family-mono, consolas, menlo, monaco, "Ubuntu Mono", "source-code-pro", monospace);
  font-size: var(--jse-font-size-mono, 14px);
}
.jse-modal.jse-transform .jse-modal-contents .jse-main-contents .jse-query-contents textarea.jse-query {
  flex: 1;
  outline: none;
  resize: vertical;
}
.jse-modal.jse-transform .jse-modal-contents .jse-main-contents .jse-data-contents {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: calc(2 * var(--jse-padding, 10px));
}
.jse-modal.jse-transform .jse-modal-contents .jse-main-contents .jse-data-contents .jse-original-data {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  box-sizing: border-box;
}
.jse-modal.jse-transform .jse-modal-contents .jse-main-contents .jse-data-contents .jse-original-data.jse-hide {
  flex: none;
}
.jse-modal.jse-transform .jse-modal-contents .jse-main-contents .jse-data-contents .jse-preview-data {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  box-sizing: border-box;
}
.jse-modal.jse-transform .jse-modal-contents .jse-main-contents .jse-data-contents.jse-hide-original-data {
  flex-direction: column;
  gap: 0;
  margin-bottom: 0;
}
.jse-modal.jse-transform .jse-modal-contents .jse-actions {
  padding: var(--jse-padding, 10px) calc(2 * var(--jse-padding, 10px)) calc(2 * var(--jse-padding, 10px));
}
@media screen and (max-width: 1200px) {
  .jse-modal.jse-transform .jse-modal-contents .jse-main-contents {
    flex-direction: column;
    overflow: auto;
  }
  .jse-modal.jse-transform .jse-modal-contents .jse-main-contents .jse-query-contents textarea.jse-query {
    min-height: 150px;
    flex: none;
  }
  .jse-modal.jse-transform .jse-modal-contents .jse-main-contents .jse-data-contents :global(.jse-tree-mode) {
    height: 300px;
    flex: none;
  }
}
.jse-modal.jse-transform .jse-label {
  font-weight: bold;
  display: block;
  box-sizing: border-box;
}
.jse-modal.jse-transform .jse-label .jse-label-inner {
  margin-top: calc(2 * var(--jse-padding, 10px));
  margin-bottom: calc(0.5 * var(--jse-padding, 10px));
  box-sizing: border-box;
}
.jse-modal.jse-transform .jse-label .jse-label-inner button {
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
.jse-modal.jse-transform :global(.jse-tree-mode) {
  flex: 1;
  background: var(--jse-input-background-readonly, transparent);
  box-shadow: none;
  box-sizing: border-box;
  --jse-main-border: var(--jse-input-border, 1px solid #d8dbdf);
}
.jse-modal.jse-transform input,
.jse-modal.jse-transform textarea {
  border: var(--jse-input-border, 1px solid #d8dbdf);
  outline: none;
  box-sizing: border-box;
  padding: calc(0.5 * var(--jse-padding, 10px));
  font-family: var(--jse-font-family-mono, consolas, menlo, monaco, "Ubuntu Mono", "source-code-pro", monospace);
  font-size: var(--jse-font-size-mono, 14px);
  color: inherit;
  background: var(--jse-input-background, var(--jse-background-color, #fff));
}
.jse-modal.jse-transform input:focus,
.jse-modal.jse-transform textarea:focus {
  border: var(--jse-input-border-focus, 1px solid var(--jse-input-border-focus, var(--jse-theme-color, #3883fa)));
}
.jse-modal.jse-transform input:read-only,
.jse-modal.jse-transform textarea:read-only {
  background: var(--jse-input-background-readonly, transparent);
}
.jse-modal.jse-transform .jse-preview.jse-error {
  flex: 1;
  background: var(--jse-input-background-readonly, transparent);
  border: var(--jse-input-border, 1px solid #d8dbdf);
  color: var(--jse-error-color, #ee5341);
  padding: calc(0.5 * var(--jse-padding, 10px));
}
.jse-modal.jse-transform :global(a) {
  color: var(--jse-a-color, #156fc5);
}
.jse-modal.jse-transform :global(a:hover) {
  color: var(--jse-a-color-highlight, #0f508d);
}</style>
