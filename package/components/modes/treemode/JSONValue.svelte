<svelte:options immutable={true} />

<script>import { isEditingSelection, isValueSelection } from '../../../logic/selection.js';
import { isSvelteActionRenderer } from '../../../typeguards.js';
export let path;
export let value;
export let context;
export let enforceString;
export let selection;
export let searchResultItems;
$: isEditing = isValueSelection(selection) && isEditingSelection(selection);
$: renderers = context.onRenderValue({
    path,
    value,
    readOnly: context.readOnly,
    enforceString,
    isEditing,
    parser: context.parser,
    normalization: context.normalization,
    selection,
    searchResultItems,
    onPatch: context.onPatch,
    onPasteJson: context.onPasteJson,
    onSelect: context.onSelect,
    onFind: context.onFind,
    findNextInside: context.findNextInside,
    focus: context.focus
});
</script>

{#each renderers as renderer}
  {#if isSvelteActionRenderer(renderer)}
    {@const action = renderer.action}
    {#key renderer.action}
      <div
        role="button"
        tabindex="-1"
        class="jse-value jse-readonly-password"
        data-type="selectable-value"
        use:action={renderer.props}
      />
    {/key}
  {:else}
    {#key renderer.component}
      <svelte:component this={renderer.component} {...renderer.props} />
    {/key}
  {/if}
{/each}
