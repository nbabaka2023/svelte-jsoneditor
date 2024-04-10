<svelte:options immutable={true} />

<script>import { getContext } from 'svelte';
import JSONRepairComponent from './repair/JSONRepairComponent.svelte';
import { onEscape } from '../../actions/onEscape.js';
export let text;
export let onParse;
export let onRepair;
export let onApply;
const { close } = getContext('simple-modal');
function handleApply(repairedText) {
    close();
    onApply(repairedText);
}
function handleCancel() {
    close();
}
</script>

<div class="jse-modal jse-repair" use:onEscape={close}>
  <JSONRepairComponent
    bind:text
    {onParse}
    {onRepair}
    onApply={handleApply}
    onCancel={handleCancel}
  />
</div>

<style src="./JSONRepairModal.scss">/* over all fonts, sizes, and colors */
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
.jse-modal.jse-repair {
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
}</style>
