<svelte:options immutable={true} />

<script>import { truncate } from '../../../../utils/stringUtils.js';
import { MAX_INLINE_OBJECT_CHARS } from '../../../../constants.js';
export let path;
export let value;
export let parser;
export let isSelected;
export let containsSearchResult;
export let containsActiveSearchResult;
export let onEdit;
</script>

<button
  type="button"
  class="jse-inline-value"
  class:jse-selected={isSelected}
  class:jse-highlight={containsSearchResult}
  class:jse-active={containsActiveSearchResult}
  on:dblclick={() => onEdit(path)}
>
  {truncate(parser.stringify(value) ?? '', MAX_INLINE_OBJECT_CHARS)}
</button>

<style src="./InlineValue.scss">/* over all fonts, sizes, and colors */
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
.jse-inline-value {
  font-family: var(--jse-font-family-mono, consolas, menlo, monaco, "Ubuntu Mono", "source-code-pro", monospace);
  font-size: var(--jse-font-size-mono, 14px);
  line-height: var(--jse-line-height, calc(1em + 4px));
  border: none;
  padding: 0 calc(0.5 * var(--jse-padding, 10px));
  background: transparent;
  color: inherit;
  cursor: pointer;
}
.jse-inline-value:hover {
  background: var(--jse-hover-background-color, rgba(0, 0, 0, 0.06));
}
.jse-inline-value.jse-selected {
  background: var(--jse-selection-background-color, #d3d3d3);
}
.jse-inline-value.jse-highlight {
  background-color: var(--jse-search-match-color, #ffe665);
  outline: var(--jse-search-match-outline, 1px solid #ffd700);
}
.jse-inline-value.jse-highlight.jse-active {
  background-color: var(--jse-search-match-active-color, #ffd700);
  outline: var(--jse-search-match-active-outline, 1px solid #e1be00);
}</style>
