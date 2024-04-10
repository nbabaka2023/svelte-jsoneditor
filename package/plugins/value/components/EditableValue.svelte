<svelte:options immutable={true} />

<script>import { compileJSONPointer } from 'immutable-json-patch';
import { isObjectOrArray, stringConvert } from '../../../utils/typeUtils.js';
import { createValueSelection, getFocusPath } from '../../../logic/selection.js';
import { getValueClass } from './utils/getValueClass.js';
import EditableDiv from '../../../components/controls/EditableDiv.svelte';
import { UpdateSelectionAfterChange } from '../../../types.js';
import { isEqual } from 'lodash-es';
export let path;
export let value;
export let parser;
export let normalization;
export let enforceString;
export let onPatch;
export let onPasteJson;
export let onSelect;
export let onFind;
export let focus;
export let findNextInside;
function convert(value) {
    return enforceString ? value : stringConvert(value, parser);
}
function handleChangeValue(newValue, updateSelection) {
    onPatch([
        {
            op: 'replace',
            path: compileJSONPointer(path),
            value: convert(normalization.unescapeValue(newValue))
        }
    ], (patchedJson, patchedState) => {
        // Leave the selection as is when it is no longer the path that we were editing here
        // This happens for example when the user clicks or double-clicks on another value
        // whilst editing a value
        if (patchedState.selection && !isEqual(path, getFocusPath(patchedState.selection))) {
            return undefined;
        }
        const selection = updateSelection === UpdateSelectionAfterChange.nextInside
            ? findNextInside(path)
            : createValueSelection(path, false);
        return {
            state: {
                ...patchedState,
                selection
            }
        };
    });
    focus();
}
function handleCancelChange() {
    onSelect(createValueSelection(path, false));
    focus();
}
function handlePaste(pastedText) {
    try {
        const pastedJson = parser.parse(pastedText);
        if (isObjectOrArray(pastedJson)) {
            onPasteJson({
                path,
                contents: pastedJson
            });
        }
    }
    catch (err) {
        // silently ignore: thee pasted text is no valid JSON object or array,
        // no need to do anything
    }
}
function handleOnValueClass(value) {
    return getValueClass(convert(normalization.unescapeValue(value)), parser);
}
</script>

<EditableDiv
  value={normalization.escapeValue(value)}
  onChange={handleChangeValue}
  onCancel={handleCancelChange}
  onPaste={handlePaste}
  {onFind}
  onValueClass={handleOnValueClass}
/>
