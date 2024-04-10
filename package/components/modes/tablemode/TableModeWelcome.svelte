<svelte:options immutable={true} />

<script>import { getIn, isJSONArray, isJSONObject } from 'immutable-json-patch';
import { Mode } from '../../../types.js';
import { valueType } from '../../../utils/typeUtils.js';
import { findNestedArrays } from '../../../logic/table.js';
import { isEmpty } from 'lodash-es';
import { stringifyJSONPath } from '../../../utils/pathUtils.js';
export let text;
export let json;
export let readOnly;
export let parser;
export let openJSONEditorModal;
export let onChangeMode;
export let onClick;
$: action = readOnly ? 'View' : 'Edit';
let nestedArrayPaths;
$: nestedArrayPaths = json
    ? findNestedArrays(json)
        .slice(0, 99)
        .filter((path) => path.length > 0)
    : [];
$: hasNestedArrays = !isEmpty(nestedArrayPaths);
$: isEmptyDocument = json === undefined && (text === '' || text === undefined);
$: documentType = hasNestedArrays
    ? 'Object with nested arrays'
    : isEmptyDocument
        ? 'An empty document'
        : isJSONObject(json)
            ? 'An object'
            : isJSONArray(json)
                ? 'An empty array' // note: can also be an array with objects but without properties
                : `A ${valueType(json, parser)}`;
function countItems(nestedArrayPath) {
    return getIn(json, nestedArrayPath).length;
}
</script>

<div class="jse-table-mode-welcome" on:click={() => onClick()} role="none">
  <div class="jse-space jse-before" />

  <div class="jse-nested-arrays">
    <div class="jse-nested-arrays-title">{documentType}</div>
    <div class="jse-nested-arrays-info">
      {#if hasNestedArrays}
        An object cannot be opened in table mode. You can open a nested array instead, or open the
        document in tree mode.
      {:else}
        {documentType} cannot be opened in table mode.
      {/if}
      {#if isEmptyDocument && !readOnly}
        You can open the document in tree mode instead, or paste a JSON Array using <b>Ctrl+V</b>.
      {:else}
        You can open the document in tree mode instead.
      {/if}
    </div>
    {#each nestedArrayPaths as nestedArrayPath}
      {@const count = countItems(nestedArrayPath)}

      <button
        type="button"
        class="jse-nested-array-action"
        on:click={() => openJSONEditorModal(nestedArrayPath)}
      >
        {action} "{stringifyJSONPath(nestedArrayPath)}"
        <span class="jse-nested-array-count">({count} {count !== 1 ? 'items' : 'item'})</span>
      </button>
    {/each}
    <button type="button" class="jse-nested-array-action" on:click={() => onChangeMode(Mode.tree)}>
      {action} in tree mode
    </button>
  </div>

  <div class="jse-space jse-after" />
</div>

<style src="./TableModeWelcome.scss">/* over all fonts, sizes, and colors */
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
.jse-table-mode-welcome {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
  align-items: center;
  border-left: var(--jse-main-border, 1px solid #d7d7d7);
  border-right: var(--jse-main-border, 1px solid #d7d7d7);
}
.jse-table-mode-welcome:last-child {
  border-bottom: var(--jse-main-border, 1px solid #d7d7d7);
}
.jse-table-mode-welcome .jse-space.jse-before {
  flex: 1;
}
.jse-table-mode-welcome .jse-nested-arrays {
  display: flex;
  flex-direction: column;
  gap: var(--jse-padding, 10px);
  max-width: 300px;
  margin: 2em var(--jse-padding, 10px);
  font-family: var(--jse-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif);
  font-size: var(--jse-font-size, 16px);
}
.jse-table-mode-welcome .jse-nested-arrays .jse-nested-arrays-info {
  color: var(--jse-panel-color-readonly, #b2b2b2);
}
.jse-table-mode-welcome .jse-nested-arrays button.jse-nested-array-action {
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
  text-align: left;
}
.jse-table-mode-welcome .jse-nested-arrays button.jse-nested-array-action:hover {
  background: var(--jse-button-primary-background-highlight, var(--jse-theme-color-highlight, #5f9dff));
}
.jse-table-mode-welcome .jse-nested-arrays button.jse-nested-array-action:disabled {
  background: var(--jse-button-primary-background-disabled, #9d9d9d);
}
.jse-table-mode-welcome .jse-nested-arrays button.jse-nested-array-action .jse-nested-array-count {
  opacity: 0.5;
  white-space: nowrap;
}
.jse-table-mode-welcome .jse-space.jse-after {
  flex: 2;
}</style>
