<svelte:options immutable={true} />

<script>import { getColorCSS } from '../../../utils/typeUtils.js';
import { getWindow } from '../../../utils/domUtils.js';
import { compileJSONPointer } from 'immutable-json-patch';
import { getContext } from 'svelte';
import ColorPickerPopup from '../../../components/controls/ColorPickerPopup.svelte';
const { openAbsolutePopup } = getContext('absolute-popup');
export let path;
export let value;
export let readOnly;
export let onPatch;
export let focus;
$: color = getColorCSS(value);
function onChange(color) {
    onPatch([
        {
            op: 'replace',
            path: compileJSONPointer(path),
            value: color
        }
    ]);
    onClose();
}
function onClose() {
    focus();
}
function openColorPicker(event) {
    if (readOnly) {
        return;
    }
    // estimate of the color picker height
    // we'll render the color picker on top
    // when there is not enough space below, and there is enough space above
    const height = 300;
    const target = event.target;
    const top = target.getBoundingClientRect().top;
    const windowHeight = getWindow(target)?.innerHeight ?? 0;
    const showOnTop = windowHeight - top < height && top > height;
    const props = {
        color: value,
        onChange,
        showOnTop
    };
    openAbsolutePopup(ColorPickerPopup, props, {
        anchor: target,
        closeOnOuterClick: true,
        onClose,
        offsetTop: 18,
        offsetLeft: -8,
        height
    });
}
</script>

<button
  type="button"
  class="jse-color-picker-button"
  class:jse-readonly={readOnly}
  style="background: {color}"
  title={!readOnly ? 'Click to open a color picker' : `Color ${value}`}
  on:click={openColorPicker}
/>

<style src="./ColorPicker.scss">/* over all fonts, sizes, and colors */
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
.jse-color-picker-button {
  font-size: var(--jse-font-size-mono, 14px);
  width: var(--jse-color-picker-button-size, 1em);
  height: var(--jse-color-picker-button-size, 1em);
  box-sizing: border-box;
  padding: 0;
  margin: 2px 0 0;
  display: inline-flex;
  vertical-align: top;
  border: 1px solid var(--jse-text-color, #4d4d4d);
  border-radius: 2px;
  background: inherit;
  outline: none;
}

.jse-color-picker-button:not(.jse-readonly) {
  cursor: pointer;
}</style>
