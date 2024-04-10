<script>import { splitValue } from '../../../../logic/search.js';
import { addNewLineSuffix } from '../../../../utils/domUtils.js';
export let text;
export let searchResultItems;
$: parts = splitValue(String(text), searchResultItems);
</script>

{#each parts as part}
  {#if part.type === 'normal'}
    {part.text}
  {:else}
    <span class="jse-highlight" class:jse-active={part.active}>{addNewLineSuffix(part.text)}</span>
  {/if}
{/each}

<style src="./SearchResultHighlighter.scss">/* over all fonts, sizes, and colors */
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
.jse-highlight {
  background-color: var(--jse-search-match-color, #ffe665);
  outline: var(--jse-search-match-outline, 1px solid #ffd700);
}
.jse-highlight.jse-active {
  background-color: var(--jse-search-match-active-color, #ffd700);
  outline: var(--jse-search-match-active-outline, 1px solid #e1be00);
}</style>
