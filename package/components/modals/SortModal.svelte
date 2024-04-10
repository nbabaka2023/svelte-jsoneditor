<svelte:options immutable={true} />

<script>import { isEmpty } from 'lodash-es';
import { getContext } from 'svelte';
import Select from 'svelte-select';
import Header from './Header.svelte';
import { getNestedPaths } from '../../utils/arrayUtils.js';
import { pathToOption, stringifyJSONPath } from '../../utils/pathUtils.js';
import { sortJson } from '../../logic/sort.js';
import { sortModalStates } from './sortModalStates';
import { compileJSONPointer, getIn } from 'immutable-json-patch';
import { createDebug } from '../../utils/debug.js';
import { onEscape } from '../../actions/onEscape.js';
const debug = createDebug('jsoneditor:SortModal');
export let id;
export let json; // the whole document
export let rootPath;
export let onSort;
const { close } = getContext('simple-modal');
const stateId = `${id}:${compileJSONPointer(rootPath)}`;
const selectedJson = getIn(json, rootPath);
$: jsonIsArray = Array.isArray(selectedJson);
$: paths = jsonIsArray && selectedJson !== undefined ? getNestedPaths(selectedJson) : undefined;
$: properties = paths ? paths.map(pathToOption) : undefined;
const asc = {
    value: 1,
    label: 'ascending'
};
const desc = {
    value: -1,
    label: 'descending'
};
const directions = [asc, desc];
let selectedProperty = sortModalStates[stateId]?.selectedProperty;
let selectedDirection = sortModalStates[stateId]?.selectedDirection || asc;
let sortError = undefined;
$: {
    // remember the selected values for the next time we open the SortModal
    // just in memory, not persisted
    sortModalStates[stateId] = {
        selectedProperty,
        selectedDirection
    };
    debug('store state in memory', stateId, sortModalStates[stateId]);
}
function handleSort() {
    try {
        sortError = undefined;
        const itemPath = selectedProperty?.value || properties?.[0]?.value || [];
        const direction = selectedDirection?.value;
        const operations = sortJson(json, rootPath, itemPath, direction);
        onSort({ operations, rootPath, itemPath, direction });
        close();
    }
    catch (err) {
        sortError = String(err);
    }
}
function focus(element) {
    element.focus();
}
</script>

<div class="jse-modal jse-sort" use:onEscape={close}>
  <Header title={jsonIsArray ? 'Sort array items' : 'Sort object keys'} />

  <div class="jse-modal-contents">
    <table>
      <colgroup>
        <col width="25%" />
        <col width="75%" />
      </colgroup>
      <tbody>
        <tr>
          <th>Path</th>
          <td>
            <input
              class="jse-path"
              type="text"
              readonly
              title="Selected path"
              value={!isEmpty(rootPath) ? stringifyJSONPath(rootPath) : '(document root)'}
            />
          </td>
        </tr>
        {#if jsonIsArray && ((properties && properties?.length > 1) || selectedProperty === undefined)}
          <tr>
            <th>Property</th>
            <td>
              <Select showChevron items={properties} bind:value={selectedProperty} />
            </td>
          </tr>
        {/if}
        <tr>
          <th>Direction</th>
          <td>
            <Select
              showChevron
              clearable={false}
              items={directions}
              bind:value={selectedDirection}
            />
          </td>
        </tr>
      </tbody>
    </table>

    <div class="jse-space">
      {#if sortError}
        <div class="jse-error">
          {sortError}
        </div>
      {/if}
    </div>

    <div class="jse-actions">
      <button
        type="button"
        class="jse-primary"
        on:click={handleSort}
        use:focus
        disabled={jsonIsArray && properties && properties?.length > 1 ? !selectedProperty : false}
      >
        Sort
      </button>
    </div>
  </div>
</div>

<style src="./SortModal.scss">/* over all fonts, sizes, and colors */
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

.jse-modal.jse-sort table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
}
.jse-modal.jse-sort table th,
.jse-modal.jse-sort table td {
  text-align: left;
  vertical-align: middle;
  font-weight: normal;
  padding-bottom: var(--jse-padding, 10px);
}
.jse-modal.jse-sort table th input.jse-path,
.jse-modal.jse-sort table td input.jse-path {
  width: 100%;
  box-sizing: border-box;
  padding: 6px 16px;
  border: var(--jse-input-border, 1px solid #d8dbdf);
  border-radius: var(--jse-input-radius, 3px);
  font-family: inherit;
  font-size: inherit;
  background: inherit;
  color: inherit;
  outline: none;
}
.jse-modal.jse-sort table th input.jse-path:read-only,
.jse-modal.jse-sort table td input.jse-path:read-only {
  background: var(--jse-input-background-readonly, transparent);
}
.jse-modal.jse-sort table th :global(.svelte-select input),
.jse-modal.jse-sort table td :global(.svelte-select input) {
  box-sizing: border-box;
}
.jse-modal.jse-sort .jse-space {
  height: 200px;
}
.jse-modal.jse-sort .jse-space .jse-error {
  color: var(--jse-error-color, #ee5341);
}</style>
