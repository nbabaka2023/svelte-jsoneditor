<svelte:options immutable={true} />

<script>import { initial, isEqual } from 'lodash-es';
import { createKeySelection, createValueSelection, isEditingSelection, isKeySelection } from '../../../logic/selection.js';
import SearchResultHighlighter from './highlight/SearchResultHighlighter.svelte';
import EditableDiv from '../../controls/EditableDiv.svelte';
import { addNewLineSuffix } from '../../../utils/domUtils.js';
import { UpdateSelectionAfterChange } from '../../../types.js';
import ContextMenuPointer from '../../../components/controls/contextmenu/ContextMenuPointer.svelte';
import { classnames } from '../../../utils/cssUtils.js';
export let path;
export let key;
export let selection;
export let searchResultItems;
export let onUpdateKey;
export let context;
$: isKeySelected = selection ? isKeySelection(selection) && isEqual(selection.path, path) : false;
$: isEditingKey = isKeySelected && isEditingSelection(selection);
function handleKeyDoubleClick(event) {
    if (!isEditingKey && !context.readOnly) {
        event.preventDefault();
        context.onSelect(createKeySelection(path, true));
    }
}
function getKeyClass(key) {
    return classnames('jse-key', {
        'jse-empty': key === ''
    });
}
function handleChangeValue(newKey, updateSelection) {
    const updatedKey = onUpdateKey(key, context.normalization.unescapeValue(newKey));
    const updatedPath = initial(path).concat(updatedKey);
    context.onSelect(updateSelection === UpdateSelectionAfterChange.nextInside
        ? createValueSelection(updatedPath, false)
        : createKeySelection(updatedPath, false));
    if (updateSelection !== UpdateSelectionAfterChange.self) {
        context.focus();
    }
}
function handleCancelChange() {
    context.onSelect(createKeySelection(path, false));
    context.focus();
}
</script>

{#if !context.readOnly && isEditingKey}
  <EditableDiv
    value={context.normalization.escapeValue(key)}
    shortText
    onChange={handleChangeValue}
    onCancel={handleCancelChange}
    onFind={context.onFind}
  />
{:else}
  <div
    role="none"
    data-type="selectable-key"
    class={getKeyClass(key)}
    on:dblclick={handleKeyDoubleClick}
  >
    {#if searchResultItems}
      <SearchResultHighlighter text={context.normalization.escapeValue(key)} {searchResultItems} />
    {:else}
      {addNewLineSuffix(context.normalization.escapeValue(key))}
    {/if}
  </div>
{/if}
{#if !context.readOnly && isKeySelected && !isEditingKey}
  <ContextMenuPointer selected={true} onContextMenu={context.onContextMenu} />
{/if}

<style src="./JSONKey.scss">/* over all fonts, sizes, and colors */
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
.jse-key {
  display: inline-block;
  min-width: 2em;
  padding: 0 5px;
  box-sizing: border-box;
  outline: none;
  border-radius: 1px;
  vertical-align: top;
  color: var(--jse-key-color, #1a1a1a);
  cursor: var(--jse-contents-cursor, pointer);
  word-break: normal;
  overflow-wrap: normal;
  white-space: pre-wrap;
}
.jse-key:hover {
  background: var(--jse-hover-background-color, rgba(0, 0, 0, 0.06));
}
.jse-key:hover {
  background: var(--jse-hover-background-color, rgba(0, 0, 0, 0.06));
}
.jse-key.jse-empty {
  min-width: 3em;
  outline: 1px dotted var(--jse-tag-background, rgba(0, 0, 0, 0.2));
  -moz-outline-radius: 2px;
}
.jse-key.jse-empty::after {
  pointer-events: none;
  color: var(--jse-tag-background, rgba(0, 0, 0, 0.2));
  content: "key";
}</style>
