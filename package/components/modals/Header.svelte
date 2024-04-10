<svelte:options immutable={true} />

<script>import { getContext } from 'svelte';
import Icon from 'svelte-awesome';
import { faDownLeftAndUpRightToCenter, faTimes, faUpRightAndDownLeftFromCenter } from '@fortawesome/free-solid-svg-icons';
export let title = 'Modal';
export let fullScreenButton = false;
export let fullscreen = false;
export let onClose = undefined;
const { close } = getContext('simple-modal');
</script>

<div class="jse-header">
  <div class="jse-title">
    {title}
  </div>
  <slot name="actions" />
  {#if fullScreenButton}
    <button
      type="button"
      class="jse-fullscreen"
      title="Toggle full screen"
      on:click={() => (fullscreen = !fullscreen)}
    >
      <Icon data={fullscreen ? faDownLeftAndUpRightToCenter : faUpRightAndDownLeftFromCenter} />
    </button>
  {/if}
  <button
    type="button"
    class="jse-close"
    on:click={() => {
      if (onClose) {
        onClose()
      } else {
        close()
      }
    }}
  >
    <Icon data={faTimes} />
  </button>
</div>

<style src="./Header.scss">/* over all fonts, sizes, and colors */
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
.jse-header {
  display: flex;
  background: var(--jse-theme-color, #3883fa);
  color: var(--jse-menu-color, var(--jse-text-color-inverse, #fff));
}
.jse-header .jse-title {
  flex: 1;
  padding: 5px;
  vertical-align: middle;
}
.jse-header button {
  border: none;
  background: transparent;
  min-width: 32px;
  color: inherit;
  cursor: pointer;
}
.jse-header button:hover {
  background: rgba(255, 255, 255, 0.1);
}</style>
