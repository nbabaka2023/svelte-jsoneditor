<svelte:options immutable={true} />

<script>import { getContext } from 'svelte';
import { IS_MAC } from '../../utils/navigatorUtils.js';
import { onEscape } from '../../actions/onEscape.js';
import Header from './Header.svelte';
const { close } = getContext('simple-modal');
const ctrl = IS_MAC ? '⌘' : 'Ctrl';
</script>

<div class="jse-modal jse-copy-paste" use:onEscape={() => close()}>
  <Header title="Copying and pasting" />

  <div class="jse-modal-contents">
    <div>These actions are unavailable via the menu. Please use:</div>

    <div class="jse-shortcuts">
      <div class="jse-shortcut">
        <div class="jse-key">
          {ctrl}+C
        </div>
        for copy
      </div>
      <div class="jse-shortcut">
        <div class="jse-key">
          {ctrl}+X
        </div>
        for cut
      </div>
      <div class="jse-shortcut">
        <div class="jse-key">
          {ctrl}+V
        </div>
        for paste
      </div>
    </div>

    <div class="jse-actions">
      <button type="button" class="jse-primary" on:click={() => close()}> Close </button>
    </div>
  </div>
</div>

<style src="./CopyPasteModal.scss">/* over all fonts, sizes, and colors */
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

.jse-modal.jse-copy-paste .jse-shortcuts {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  margin: calc(2 * var(--jse-padding, 10px)) 0;
}
.jse-modal.jse-copy-paste .jse-shortcuts .jse-shortcut .jse-key {
  font-size: 200%;
  color: var(--jse-theme-color, #3883fa);
}</style>
