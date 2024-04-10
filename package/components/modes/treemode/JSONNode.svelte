<svelte:options immutable={true} />

<script>import { faCaretDown, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { appendToJSONPointer, compileJSONPointer, parseJSONPointer } from 'immutable-json-patch';
import { initial, isEqual, last } from 'lodash-es';
import Icon from 'svelte-awesome';
import { DEFAULT_VISIBLE_SECTIONS, HOVER_COLLECTION, HOVER_INSERT_AFTER, HOVER_INSERT_INSIDE, INSERT_EXPLANATION } from '../../../constants.js';
import { getEnforceString, getVisibleCaretPositions } from '../../../logic/documentState.js';
import { rename } from '../../../logic/operations.js';
import { createAfterSelection, createInsideSelection, createMultiSelection, fromCaretPosition, fromSelectionType, getAnchorPath, getEndPath, getFocusPath, getSelectionPaths, getStartPath, isAfterSelection, isInsideSelection, isKeySelection, isMultiSelection, isValueSelection, pathInSelection, isEditingSelection, selectionIfOverlapping } from '../../../logic/selection.js';
import { encodeDataPath, getDataPathFromTarget, getSelectionTypeFromTarget, isChildOfAttribute, isChildOfNodeName, isContentEditableDiv } from '../../../utils/domUtils.js';
import CollapsedItems from './CollapsedItems.svelte';
import ContextMenuPointer from '../../../components/controls/contextmenu/ContextMenuPointer.svelte';
import JSONKey from './JSONKey.svelte';
import JSONValue from './JSONValue.svelte';
import { singleton } from './singleton.js';
import { createDebug } from '../../../utils/debug.js';
import { onMoveSelection } from '../../../logic/dragging.js';
import { forEachIndex, moveItems } from '../../../utils/arrayUtils.js';
import { SelectionType } from '../../../types.js';
import { filterPointerOrUndefined } from '../../../utils/jsonPointer.js';
import { filterKeySearchResults, filterValueSearchResults } from '../../../logic/search.js';
import { createMemoizePath } from '../../../utils/pathUtils.js';
import ValidationErrorIcon from './ValidationErrorIcon.svelte';
import { isObject } from '../../../utils/typeUtils.js';
import { classnames } from '../../../utils/cssUtils.js';
export let value;
export let path;
export let expandedMap;
export let enforceStringMap;
export let visibleSectionsMap;
export let validationErrorsMap;
export let searchResultItemsMap;
export let selection;
export let context;
export let onDragSelectionStart;
const debug = createDebug('jsoneditor:JSONNode');
let hover = undefined;
let hoverTimer = undefined;
let dragging = undefined;
// important to prevent creating a new path for all children with every re-render,
// that would force all children to re-render
const memoizePath = createMemoizePath();
let pointer;
$: pointer = compileJSONPointer(path);
let expanded;
$: expanded = expandedMap ? expandedMap[pointer] === true : false;
let enforceString;
$: enforceString = getEnforceString(value, enforceStringMap, pointer, context.parser);
let visibleSections;
$: visibleSections = visibleSectionsMap ? visibleSectionsMap[pointer] : undefined;
let validationError;
$: validationError = validationErrorsMap ? validationErrorsMap[pointer] : undefined;
let isNodeSelected;
$: isNodeSelected = pathInSelection(context.getJson(), selection, path);
$: root = path.length === 0;
// TODO: extract getProps into a separate function
function getProps(path, object, expandedMap, enforceStringMap, visibleSectionsMap, validationErrorsMap, searchResultItemsMap, selection, dragging) {
    let props = Object.keys(object).map((key) => {
        const keyPath = memoizePath(path.concat(key));
        const keyPointer = appendToJSONPointer(pointer, key);
        return {
            key,
            value: object[key],
            path: keyPath,
            expandedMap: filterPointerOrUndefined(expandedMap, keyPointer),
            enforceStringMap: filterPointerOrUndefined(enforceStringMap, keyPointer),
            visibleSectionsMap: filterPointerOrUndefined(visibleSectionsMap, keyPointer),
            validationErrorsMap: filterPointerOrUndefined(validationErrorsMap, keyPointer),
            keySearchResultItemsMap: filterKeySearchResults(searchResultItemsMap, keyPointer),
            valueSearchResultItemsMap: filterPointerOrUndefined(searchResultItemsMap, keyPointer),
            selection: selectionIfOverlapping(context.getJson(), selection, keyPath)
        };
    });
    // reorder the props when dragging
    if (dragging && dragging.offset !== 0) {
        props = moveItems(props, dragging.selectionStartIndex, dragging.selectionItemsCount, dragging.offset);
    }
    return props;
}
// TODO: extract getItems into a separate function
function getItems(path, array, visibleSection, expandedMap, enforceStringMap, visibleSectionsMap, validationErrorsMap, searchResultItemsMap, selection, dragging) {
    const start = visibleSection.start;
    const end = Math.min(visibleSection.end, array.length);
    let items = [];
    for (let index = start; index < end; index++) {
        const itemPath = memoizePath(path.concat(String(index)));
        const itemPointer = appendToJSONPointer(pointer, index);
        items.push({
            index,
            value: array[index],
            path: itemPath,
            expandedMap: filterPointerOrUndefined(expandedMap, itemPointer),
            enforceStringMap: filterPointerOrUndefined(enforceStringMap, itemPointer),
            visibleSectionsMap: filterPointerOrUndefined(visibleSectionsMap, itemPointer),
            validationErrorsMap: filterPointerOrUndefined(validationErrorsMap, itemPointer),
            searchResultItemsMap: filterPointerOrUndefined(searchResultItemsMap, itemPointer),
            selection: selectionIfOverlapping(context.getJson(), selection, itemPath)
        });
    }
    // reorder the items when dragging
    if (dragging && dragging.offset !== 0) {
        const originalIndexes = items.map((item) => item.index);
        items = moveItems(items, dragging.selectionStartIndex, dragging.selectionItemsCount, dragging.offset);
        // maintain the original indexes. Indexes must keep the same order,
        // note that the indexes can be a visible section from 200-300 for example
        for (let i = 0; i < items.length; i++) {
            items[i].index = originalIndexes[i];
        }
    }
    return items;
}
function toggleExpand(event) {
    event.stopPropagation();
    const recursive = event.ctrlKey;
    context.onExpand(path, !expanded, recursive);
}
function handleExpand(event) {
    event.stopPropagation();
    context.onExpand(path, true);
}
function handleUpdateKey(oldKey, newKey) {
    const operations = rename(path, Object.keys(value), oldKey, newKey);
    context.onPatch(operations);
    // It is possible that the applied key differs from newKey,
    // to prevent duplicate keys. Here we figure out the actually applied key
    return last(parseJSONPointer(operations[0].path));
}
function handleMouseDown(event) {
    // check if the mouse down is not happening in the key or value input fields or on a button
    if (isContentEditableDiv(event.target) ||
        (event.which === 1 && isChildOfNodeName(event.target, 'BUTTON')) // left mouse on a button
    ) {
        return;
    }
    event.stopPropagation();
    event.preventDefault();
    // due to event.stopPropagation here and there, the focus tracker does not receive this mouse event.
    // make sure the editor has focus
    context.focus();
    // we attach the mousemove and mouseup event listeners to the global document,
    // so we will not miss if the mouse events happen outside the editor
    document.addEventListener('mousemove', handleMouseMoveGlobal, true);
    document.addEventListener('mouseup', handleMouseUpGlobal);
    const anchorType = getSelectionTypeFromTarget(event.target);
    const json = context.getJson();
    const documentState = context.getDocumentState();
    if (selection &&
        anchorType !== SelectionType.after &&
        anchorType !== SelectionType.inside &&
        (selection.type === anchorType || selection.type === SelectionType.multi) &&
        pathInSelection(json, selection, path)) {
        // when right-clicking inside the current selection, do nothing: context menu will open
        // when left-clicking inside the current selection, do nothing: it can be the start of dragging
        if (event.button === 0) {
            onDragSelectionStart(event);
        }
        return;
    }
    // TODO: refactor dragging, there are now two separate mechanisms handling mouse movement: with dragging.* and with singleton.*
    singleton.selecting = true;
    singleton.selectionAnchor = path;
    singleton.selectionAnchorType = anchorType;
    singleton.selectionFocus = path;
    if (event.shiftKey) {
        // Shift+Click will select multiple entries
        const fullSelection = context.getDocumentState().selection;
        if (fullSelection) {
            context.onSelect(createMultiSelection(getAnchorPath(fullSelection), path));
        }
    }
    else {
        if (anchorType === SelectionType.multi) {
            if (root && event.target.hasAttribute('data-path')) {
                const lastCaretPosition = last(getVisibleCaretPositions(value, documentState));
                context.onSelect(fromCaretPosition(lastCaretPosition));
            }
            else {
                context.onSelect(createMultiSelection(path, path));
            }
        }
        else if (json !== undefined) {
            context.onSelect(fromSelectionType(json, anchorType, path));
        }
    }
}
function handleMouseMove(event) {
    if (singleton.selecting) {
        event.preventDefault();
        event.stopPropagation();
        if (singleton.selectionFocus == null) {
            // First move event, no selection yet.
            // Clear the default selection of the browser
            if (window.getSelection) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                window.getSelection().empty();
            }
        }
        const selectionType = getSelectionTypeFromTarget(event.target);
        if (!isEqual(path, singleton.selectionFocus) ||
            selectionType !== singleton.selectionAnchorType) {
            singleton.selectionFocus = path;
            singleton.selectionAnchorType = selectionType; // TODO: this is a bit ugly
            context.onSelect(createMultiSelection(singleton.selectionAnchor || singleton.selectionFocus, singleton.selectionFocus));
        }
    }
}
function handleMouseMoveGlobal(event) {
    context.onDrag(event);
}
function handleMouseUpGlobal(event) {
    if (singleton.selecting) {
        singleton.selecting = false;
        event.stopPropagation();
    }
    context.onDragEnd();
    document.removeEventListener('mousemove', handleMouseMoveGlobal, true);
    document.removeEventListener('mouseup', handleMouseUpGlobal);
}
function findContentTop() {
    return context.findElement([])?.getBoundingClientRect()?.top || 0;
}
function calculateDeltaY(dragging, event) {
    // calculate the contentOffset, this changes when scrolling
    const contentTop = findContentTop();
    const contentOffset = contentTop - dragging.initialContentTop;
    // calculate the vertical mouse movement
    const clientOffset = event.clientY - dragging.initialClientY;
    return clientOffset - contentOffset;
}
function handleDragSelectionStart(event) {
    if (context.readOnly || !selection) {
        return;
    }
    const selectionParentPath = initial(getFocusPath(selection));
    if (!isEqual(path, selectionParentPath)) {
        // pass to parent
        onDragSelectionStart(event);
        return;
    }
    // note that the returned items will be of one section only,
    // and when the selection is spread over multiple sections,
    // no items will be returned: this is not (yet) supported
    const items = getVisibleItemsWithHeights(selection, visibleSections || DEFAULT_VISIBLE_SECTIONS);
    debug('dragSelectionStart', { selection, items });
    if (!items) {
        debug('Cannot drag the current selection (probably spread over multiple sections)');
        return;
    }
    const json = context.getJson();
    if (json === undefined) {
        return;
    }
    const initialPath = getStartPath(json, selection);
    const selectionStartIndex = items.findIndex((item) => isEqual(item.path, initialPath));
    const documentState = context.getDocumentState();
    const { offset } = onMoveSelection({
        json,
        documentState,
        deltaY: 0,
        items
    });
    dragging = {
        initialTarget: event.target,
        initialClientY: event.clientY,
        initialContentTop: findContentTop(),
        selectionStartIndex,
        selectionItemsCount: getSelectionPaths(json, selection).length,
        items,
        offset,
        didMoveItems: false // whether items have been moved during dragging or not
    };
    singleton.dragging = true;
    document.addEventListener('mousemove', handleDragSelection, true);
    document.addEventListener('mouseup', handleDragSelectionEnd);
}
function handleDragSelection(event) {
    if (dragging) {
        const json = context.getJson();
        if (json === undefined) {
            return;
        }
        const documentState = context.getDocumentState();
        const deltaY = calculateDeltaY(dragging, event);
        const { offset } = onMoveSelection({
            json,
            documentState,
            deltaY,
            items: dragging.items
        });
        if (offset !== dragging.offset) {
            debug('drag selection', offset, deltaY);
            dragging = {
                ...dragging,
                offset,
                didMoveItems: true
            };
        }
    }
}
function handleDragSelectionEnd(event) {
    if (dragging) {
        const json = context.getJson();
        if (json === undefined) {
            return;
        }
        const documentState = context.getDocumentState();
        const deltaY = calculateDeltaY(dragging, event);
        const { operations, updatedSelection } = onMoveSelection({
            json,
            documentState,
            deltaY,
            items: dragging.items
        });
        if (operations) {
            context.onPatch(operations, (_, patchedState) => ({
                state: {
                    ...patchedState,
                    selection: updatedSelection || selection
                }
            }));
        }
        else {
            // the user did click inside the selection and no contents have been dragged,
            // select the clicked item
            if (event.target === dragging.initialTarget && !dragging.didMoveItems) {
                const selectionType = getSelectionTypeFromTarget(event.target);
                const path = getDataPathFromTarget(event.target);
                if (path) {
                    context.onSelect(fromSelectionType(json, selectionType, path));
                }
            }
        }
        dragging = undefined;
        singleton.dragging = false;
        document.removeEventListener('mousemove', handleDragSelection, true);
        document.removeEventListener('mouseup', handleDragSelectionEnd);
    }
}
/**
 * Get a list with all visible items and their rendered heights inside
 * this object or array
 */
// TODO: extract and unit test getVisibleItemsWithHeights
function getVisibleItemsWithHeights(selection, visibleSections) {
    const items = [];
    function addHeight(prop) {
        const itemPath = path.concat(prop);
        const element = context.findElement(itemPath);
        if (element != null) {
            items.push({
                path: itemPath,
                height: element.clientHeight
            });
        }
    }
    if (Array.isArray(value)) {
        const json = context.getJson();
        if (json === undefined) {
            return null;
        }
        const startPath = getStartPath(json, selection);
        const endPath = getEndPath(json, selection);
        const startIndex = parseInt(last(startPath), 10);
        const endIndex = parseInt(last(endPath), 10);
        // find the section where the selection is
        // if the selection is spread over multiple visible sections,
        // we will not return any items, so dragging will not work there.
        // We do this to keep things simple for now.
        const currentSection = visibleSections.find((visibleSection) => {
            return startIndex >= visibleSection.start && endIndex <= visibleSection.end;
        });
        if (!currentSection) {
            return null;
        }
        const { start, end } = currentSection;
        forEachIndex(start, Math.min(value.length, end), (index) => addHeight(String(index)));
    }
    else {
        // value is Object
        Object.keys(value).forEach(addHeight);
    }
    return items;
}
function handleMouseOver(event) {
    if (singleton.selecting || singleton.dragging) {
        return;
    }
    event.stopPropagation();
    if (isChildOfAttribute(event.target, 'data-type', 'selectable-value')) {
        hover = HOVER_COLLECTION;
    }
    else if (isChildOfAttribute(event.target, 'data-type', 'insert-selection-area-inside')) {
        hover = HOVER_INSERT_INSIDE;
    }
    else if (isChildOfAttribute(event.target, 'data-type', 'insert-selection-area-after')) {
        hover = HOVER_INSERT_AFTER;
    }
    clearTimeout(hoverTimer);
}
function handleMouseOut(event) {
    event.stopPropagation();
    // to prevent "flickering" in the hovering state when hovering on the edge
    // of the insert area context menu button: it's visibility toggles when
    // `hover` toggles, which will alternating mouseout and mouseover events
    hoverTimer = window.setTimeout(() => (hover = undefined));
}
function handleInsertInside(event) {
    if (!event.shiftKey) {
        event.stopPropagation();
        event.preventDefault();
        context.onSelect(createInsideSelection(path));
    }
}
function handleInsertAfter(event) {
    if (!event.shiftKey) {
        event.stopPropagation();
        event.preventDefault();
        context.onSelect(createAfterSelection(path));
    }
}
function handleInsertInsideOpenContextMenu(contextMenuProps) {
    context.onSelect(createInsideSelection(path));
    context.onContextMenu(contextMenuProps);
}
function handleInsertAfterOpenContextMenu(contextMenuProps) {
    context.onSelect(createAfterSelection(path));
    context.onContextMenu(contextMenuProps);
}
</script>

<div
  role="treeitem"
  tabindex="-1"
  class={classnames(
    'jse-json-node',
    { 'jse-expanded': expanded },
    context.onClassName(path, value)
  )}
  data-path={encodeDataPath(path)}
  aria-selected={isNodeSelected}
  style:--level={path.length}
  class:jse-root={root}
  class:jse-selected={isNodeSelected && isMultiSelection(selection)}
  class:jse-selected-key={isNodeSelected && isKeySelection(selection)}
  class:jse-selected-value={isNodeSelected && isValueSelection(selection)}
  class:jse-readonly={context.readOnly}
  class:jse-hovered={hover === HOVER_COLLECTION}
  on:mousedown={handleMouseDown}
  on:mousemove={handleMouseMove}
  on:mouseover={handleMouseOver}
  on:mouseout={handleMouseOut}
  on:focus={undefined}
  on:blur={undefined}
>
  {#if Array.isArray(value)}
    <div class="jse-header-outer">
      <div class="jse-header">
        <button
          type="button"
          class="jse-expand"
          on:click={toggleExpand}
          title="Expand or collapse this array (Ctrl+Click to expand/collapse recursively)"
        >
          {#if expanded}
            <Icon data={faCaretDown} />
          {:else}
            <Icon data={faCaretRight} />
          {/if}
        </button>
        <slot name="identifier" />
        {#if !root}
          <div class="jse-separator">:</div>
        {/if}
        <div class="jse-meta">
          <div class="jse-meta-inner" data-type="selectable-value">
            {#if expanded}
              <div class="jse-bracket">[</div>
              <span class="jse-tag jse-expanded">
                {value.length}
                {value.length === 1 ? 'item' : 'items'}
              </span>
              &nbsp;
            {:else}
              <div class="jse-bracket">[</div>
              <button type="button" class="jse-tag" on:click={handleExpand}>
                {value.length}
                {value.length === 1 ? 'item' : 'items'}
              </button>
              <div class="jse-bracket">]</div>
            {/if}
          </div>
        </div>
        {#if !context.readOnly && isNodeSelected && selection && (isValueSelection(selection) || isMultiSelection(selection)) && !isEditingSelection(selection) && isEqual(getFocusPath(selection), path)}
          <div class="jse-context-menu-pointer-anchor">
            <ContextMenuPointer selected={true} onContextMenu={context.onContextMenu} />
          </div>
        {/if}
      </div>
      {#if validationError && (!expanded || !validationError.isChildError)}
        <ValidationErrorIcon {validationError} onExpand={handleExpand} />
      {/if}
      {#if expanded}
        <div
          role="none"
          class="jse-insert-selection-area jse-inside"
          data-type="insert-selection-area-inside"
          on:click={handleInsertInside}
        />
      {:else}
        <div
          role="none"
          class="jse-insert-selection-area jse-after"
          data-type="insert-selection-area-after"
          on:click={handleInsertAfter}
        />
      {/if}
    </div>
    {#if expanded}
      <div class="jse-items">
        {#if !context.readOnly && (hover === HOVER_INSERT_INSIDE || (isNodeSelected && isInsideSelection(selection)))}
          <div
            class="jse-insert-area jse-inside"
            class:jse-hovered={hover === HOVER_INSERT_INSIDE}
            class:jse-selected={isNodeSelected && isInsideSelection(selection)}
            data-type="insert-selection-area-inside"
            style:--level={path.length + 1}
            title={INSERT_EXPLANATION}
          >
            <ContextMenuPointer
              selected={isNodeSelected && isInsideSelection(selection)}
              onContextMenu={handleInsertInsideOpenContextMenu}
            />
          </div>
        {/if}
        {#each visibleSections || DEFAULT_VISIBLE_SECTIONS as visibleSection, sectionIndex (sectionIndex)}
          {#each getItems(path, value, visibleSection, expandedMap, enforceStringMap, visibleSectionsMap, validationErrorsMap, searchResultItemsMap, selection, dragging) as item (item.index)}
            <svelte:self
              value={item.value}
              path={item.path}
              expandedMap={item.expandedMap}
              enforceStringMap={item.enforceStringMap}
              visibleSectionsMap={item.visibleSectionsMap}
              validationErrorsMap={item.validationErrorsMap}
              searchResultItemsMap={item.searchResultItemsMap}
              selection={item.selection}
              {context}
              onDragSelectionStart={handleDragSelectionStart}
            >
              <div slot="identifier" class="jse-identifier">
                <div class="jse-index">{item.index}</div>
              </div>
            </svelte:self>
          {/each}
          {#if visibleSection.end < value.length}
            <CollapsedItems
              visibleSections={visibleSections || DEFAULT_VISIBLE_SECTIONS}
              {sectionIndex}
              total={value.length}
              {path}
              onExpandSection={context.onExpandSection}
              {selection}
              {context}
            />
          {/if}
        {/each}
      </div>
      <div class="jse-footer-outer">
        <div data-type="selectable-value" class="jse-footer">
          <span class="jse-bracket">]</span>
        </div>
        {#if !root}
          <div
            role="none"
            class="jse-insert-selection-area jse-after"
            data-type="insert-selection-area-after"
            on:click={handleInsertAfter}
          />
        {/if}
      </div>
    {/if}
  {:else if isObject(value)}
    <div class="jse-header-outer">
      <div class="jse-header">
        <button
          type="button"
          class="jse-expand"
          on:click={toggleExpand}
          title="Expand or collapse this object (Ctrl+Click to expand/collapse recursively)"
        >
          {#if expanded}
            <Icon data={faCaretDown} />
          {:else}
            <Icon data={faCaretRight} />
          {/if}
        </button>
        <slot name="identifier" />
        {#if !root}
          <div class="jse-separator">:</div>
        {/if}
        <div class="jse-meta" data-type="selectable-value">
          <div class="jse-meta-inner">
            {#if expanded}
              <div class="jse-bracket jse-expanded">&lbrace;</div>
            {:else}
              <div class="jse-bracket">&lbrace;</div>
              <button type="button" class="jse-tag" on:click={handleExpand}>
                {Object.keys(value).length}
                {Object.keys(value).length === 1 ? 'prop' : 'props'}
              </button>
              <div class="jse-bracket">&rbrace;</div>
            {/if}
          </div>
        </div>
        {#if !context.readOnly && isNodeSelected && selection && (isValueSelection(selection) || isMultiSelection(selection)) && !isEditingSelection(selection) && isEqual(getFocusPath(selection), path)}
          <div class="jse-context-menu-pointer-anchor">
            <ContextMenuPointer selected={true} onContextMenu={context.onContextMenu} />
          </div>
        {/if}
      </div>
      {#if validationError && (!expanded || !validationError.isChildError)}
        <ValidationErrorIcon {validationError} onExpand={handleExpand} />
      {/if}
      {#if expanded}
        <div
          role="none"
          class="jse-insert-selection-area jse-inside"
          data-type="insert-selection-area-inside"
          on:click={handleInsertInside}
        />
      {:else if !root}
        <div
          role="none"
          class="jse-insert-selection-area jse-after"
          data-type="insert-selection-area-after"
          on:click={handleInsertAfter}
        />
      {/if}
    </div>
    {#if expanded}
      <div class="jse-props">
        {#if !context.readOnly && (hover === HOVER_INSERT_INSIDE || (isNodeSelected && isInsideSelection(selection)))}
          <div
            class="jse-insert-area jse-inside"
            class:jse-hovered={hover === HOVER_INSERT_INSIDE}
            class:jse-selected={isNodeSelected && isInsideSelection(selection)}
            data-type="insert-selection-area-inside"
            style:--level={path.length + 1}
            title={INSERT_EXPLANATION}
          >
            <ContextMenuPointer
              selected={isNodeSelected && isInsideSelection(selection)}
              onContextMenu={handleInsertInsideOpenContextMenu}
            />
          </div>
        {/if}
        {#each getProps(path, value, expandedMap, enforceStringMap, visibleSectionsMap, validationErrorsMap, searchResultItemsMap, selection, dragging) as prop}
          <svelte:self
            value={prop.value}
            path={prop.path}
            expandedMap={prop.expandedMap}
            enforceStringMap={prop.enforceStringMap}
            visibleSectionsMap={prop.visibleSectionsMap}
            validationErrorsMap={prop.validationErrorsMap}
            searchResultItemsMap={prop.valueSearchResultItemsMap}
            selection={prop.selection}
            {context}
            onDragSelectionStart={handleDragSelectionStart}
          >
            <div slot="identifier" class="jse-identifier">
              <JSONKey
                path={prop.path}
                key={prop.key}
                selection={prop.selection}
                searchResultItems={prop.keySearchResultItemsMap}
                {context}
                onUpdateKey={handleUpdateKey}
              />
            </div>
          </svelte:self>
        {/each}
      </div>
      <div class="jse-footer-outer">
        <div data-type="selectable-value" class="jse-footer">
          <div class="jse-bracket">&rbrace;</div>
        </div>
        {#if !root}
          <div
            role="none"
            class="jse-insert-selection-area jse-after"
            data-type="insert-selection-area-after"
            on:click={handleInsertAfter}
          />
        {/if}
      </div>
    {/if}
  {:else}
    <div class="jse-contents-outer">
      <div class="jse-contents">
        <slot name="identifier" />
        {#if !root}
          <div class="jse-separator">:</div>
        {/if}
        <JSONValue
          {path}
          {value}
          enforceString={enforceString || false}
          selection={isNodeSelected ? selection : null}
          searchResultItems={filterValueSearchResults(searchResultItemsMap, pointer)}
          {context}
        />
        {#if !context.readOnly && isNodeSelected && selection && (isValueSelection(selection) || isMultiSelection(selection)) && !isEditingSelection(selection) && isEqual(getFocusPath(selection), path)}
          <div class="jse-context-menu-pointer-anchor">
            <ContextMenuPointer selected={true} onContextMenu={context.onContextMenu} />
          </div>
        {/if}
      </div>
      {#if validationError}
        <ValidationErrorIcon {validationError} onExpand={handleExpand} />
      {/if}
      {#if !root}
        <div
          role="none"
          class="jse-insert-selection-area jse-after"
          data-type="insert-selection-area-after"
          on:click={handleInsertAfter}
        />
      {/if}
    </div>
  {/if}
  {#if !context.readOnly && (hover === HOVER_INSERT_AFTER || (isNodeSelected && isAfterSelection(selection)))}
    <div
      class="jse-insert-area jse-after"
      class:jse-hovered={hover === HOVER_INSERT_AFTER}
      class:jse-selected={isNodeSelected && isAfterSelection(selection)}
      data-type="insert-selection-area-after"
      title={INSERT_EXPLANATION}
    >
      <ContextMenuPointer
        selected={isNodeSelected && isAfterSelection(selection)}
        onContextMenu={handleInsertAfterOpenContextMenu}
      />
    </div>
  {/if}
</div>

<style src="./JSONNode.scss">/* over all fonts, sizes, and colors */
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
.jse-json-node {
  position: relative;
  color: var(--jse-text-color, #4d4d4d);
}
.jse-json-node.jse-root {
  min-height: 100%;
  padding-bottom: 2px;
  box-sizing: border-box;
}
.jse-json-node.jse-root > .jse-header-outer :global(.jse-context-menu-pointer),
.jse-json-node.jse-root > .jse-contents-outer > .jse-contents :global(.jse-context-menu-pointer) {
  top: 0;
  right: calc(-2px - var(--jse-context-menu-pointer-size, calc(1em + 4px)));
}
.jse-json-node.jse-root > .jse-contents-outer > .jse-contents {
  padding-left: 0;
}
.jse-json-node .jse-props,
.jse-json-node .jse-items {
  position: relative;
}
.jse-json-node .jse-header-outer,
.jse-json-node .jse-footer-outer {
  display: flex;
  margin-left: calc(var(--level) * var(--jse-indent-size, calc(1em + 4px)));
}
.jse-json-node .jse-header {
  position: relative;
}
.jse-json-node .jse-header .jse-meta > .jse-meta-inner {
  display: flex;
  justify-content: center;
}
.jse-json-node .jse-contents-outer {
  display: flex;
  margin-left: calc(var(--level) * var(--jse-indent-size, calc(1em + 4px)));
}
.jse-json-node .jse-header,
.jse-json-node .jse-contents {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}
.jse-json-node .jse-contents {
  padding-left: var(--jse-indent-size, calc(1em + 4px));
}
.jse-json-node .jse-footer {
  display: inline-flex;
  padding-left: calc(var(--jse-indent-size, calc(1em + 4px)) + 5px);
}
.jse-json-node .jse-header,
.jse-json-node .jse-contents,
.jse-json-node .jse-footer {
  background: var(--jse-contents-background-color, transparent);
}
.jse-json-node .jse-insert-selection-area {
  visibility: hidden;
  padding: 0 calc(0.5 * var(--jse-padding, 10px));
  flex: 1;
}
.jse-json-node .jse-insert-selection-area.jse-inside {
  display: inline-flex;
  align-items: center;
}
.jse-json-node .jse-insert-selection-area.jse-after {
  display: flex;
  align-items: flex-end;
}
.jse-json-node .jse-context-menu-pointer-anchor {
  position: relative;
}
.jse-json-node .jse-insert-area {
  display: flex;
  position: relative;
  z-index: 1;
  margin-left: calc(var(--level) * var(--jse-indent-size, calc(1em + 4px)));
  max-width: 250px;
  min-width: 100px;
  height: 0;
  margin-right: calc(0.5 * var(--jse-padding, 10px));
  outline: 1px solid;
}
.jse-json-node .jse-insert-area :global(.jse-context-menu-pointer) {
  right: -1px;
  background: var(--jse-context-menu-pointer-hover-background, #b2b2b2);
}
.jse-json-node .jse-insert-area.jse-hovered {
  outline-color: var(--jse-context-menu-pointer-hover-background, #b2b2b2);
}
.jse-json-node:hover > .jse-contents-outer .jse-insert-selection-area:not(.jse-selected),
.jse-json-node .jse-header-outer:hover > .jse-insert-selection-area:not(.jse-selected),
.jse-json-node .jse-footer-outer:hover .jse-insert-selection-area:not(.jse-selected) {
  visibility: visible;
}
.jse-json-node.jse-hovered > .jse-header-outer > .jse-header > .jse-meta,
.jse-json-node.jse-hovered .jse-props .jse-header,
.jse-json-node.jse-hovered .jse-items .jse-header,
.jse-json-node.jse-hovered .jse-props .jse-contents,
.jse-json-node.jse-hovered .jse-items .jse-contents,
.jse-json-node.jse-hovered .jse-footer {
  background: var(--jse-hover-background-color, rgba(0, 0, 0, 0.06));
}
.jse-json-node.jse-selected > .jse-header-outer > .jse-header > .jse-meta,
.jse-json-node.jse-selected .jse-props .jse-header,
.jse-json-node.jse-selected .jse-items .jse-header,
.jse-json-node.jse-selected .jse-props .jse-contents,
.jse-json-node.jse-selected .jse-items .jse-contents,
.jse-json-node.jse-selected .jse-header,
.jse-json-node.jse-selected .jse-contents,
.jse-json-node.jse-selected .jse-footer,
.jse-json-node.jse-selected :global(.jse-key),
.jse-json-node.jse-selected :global(.jse-value) {
  background: var(--jse-selection-background-color, #d3d3d3);
  cursor: var(--jse-contents-selected-cursor, grab);
}
.jse-json-node.jse-selected .jse-expand {
  background: var(--jse-selection-background-color, #d3d3d3);
}
.jse-json-node.jse-selected-key > .jse-contents-outer > .jse-contents > :global(.jse-identifier) > :global(.jse-key),
.jse-json-node.jse-selected-key > .jse-header-outer > .jse-header > :global(.jse-identifier) > :global(.jse-key) {
  background: var(--jse-selection-background-color, #d3d3d3);
  cursor: var(--jse-contents-selected-cursor, grab);
}
.jse-json-node.jse-selected-value > .jse-contents-outer > .jse-contents > :global(.jse-value) {
  background: var(--jse-selection-background-color, #d3d3d3);
  cursor: var(--jse-contents-selected-cursor, grab);
}
.jse-json-node :global(.jse-collapsed-items.jse-selected), .jse-json-node.jse-selected :global(.jse-collapsed-items), .jse-json-node.jse-selected-value :global(.jse-collapsed-items) {
  background-color: var(--jse-selection-background-color, #d3d3d3);
  --jse-collapsed-items-background-color: var(--jse-collapsed-items-selected-background-color, #c2c2c2);
}
.jse-json-node.jse-selected-value .jse-meta,
.jse-json-node.jse-selected-value > .jse-header-outer > .jse-header > .jse-meta,
.jse-json-node.jse-selected-value > .jse-footer-outer > .jse-footer,
.jse-json-node.jse-selected-value .jse-props .jse-contents,
.jse-json-node.jse-selected-value .jse-props .jse-header,
.jse-json-node.jse-selected-value .jse-props .jse-footer,
.jse-json-node.jse-selected-value .jse-props .jse-expand,
.jse-json-node.jse-selected-value .jse-items .jse-contents,
.jse-json-node.jse-selected-value .jse-items .jse-header,
.jse-json-node.jse-selected-value .jse-items .jse-footer,
.jse-json-node.jse-selected-value .jse-items .jse-expand {
  background: var(--jse-selection-background-color, #d3d3d3);
}
.jse-json-node.jse-selected-value .jse-meta :global(.jse-key),
.jse-json-node.jse-selected-value .jse-meta :global(.jse-value),
.jse-json-node.jse-selected-value > .jse-header-outer > .jse-header > .jse-meta :global(.jse-key),
.jse-json-node.jse-selected-value > .jse-header-outer > .jse-header > .jse-meta :global(.jse-value),
.jse-json-node.jse-selected-value > .jse-footer-outer > .jse-footer :global(.jse-key),
.jse-json-node.jse-selected-value > .jse-footer-outer > .jse-footer :global(.jse-value),
.jse-json-node.jse-selected-value .jse-props .jse-contents :global(.jse-key),
.jse-json-node.jse-selected-value .jse-props .jse-contents :global(.jse-value),
.jse-json-node.jse-selected-value .jse-props .jse-header :global(.jse-key),
.jse-json-node.jse-selected-value .jse-props .jse-header :global(.jse-value),
.jse-json-node.jse-selected-value .jse-props .jse-footer :global(.jse-key),
.jse-json-node.jse-selected-value .jse-props .jse-footer :global(.jse-value),
.jse-json-node.jse-selected-value .jse-props .jse-expand :global(.jse-key),
.jse-json-node.jse-selected-value .jse-props .jse-expand :global(.jse-value),
.jse-json-node.jse-selected-value .jse-items .jse-contents :global(.jse-key),
.jse-json-node.jse-selected-value .jse-items .jse-contents :global(.jse-value),
.jse-json-node.jse-selected-value .jse-items .jse-header :global(.jse-key),
.jse-json-node.jse-selected-value .jse-items .jse-header :global(.jse-value),
.jse-json-node.jse-selected-value .jse-items .jse-footer :global(.jse-key),
.jse-json-node.jse-selected-value .jse-items .jse-footer :global(.jse-value),
.jse-json-node.jse-selected-value .jse-items .jse-expand :global(.jse-key),
.jse-json-node.jse-selected-value .jse-items .jse-expand :global(.jse-value) {
  background: var(--jse-selection-background-color, #d3d3d3);
  cursor: var(--jse-contents-selected-cursor, grab);
}
.jse-json-node.jse-readonly {
  --jse-contents-selected-cursor: pointer;
}
.jse-json-node .jse-insert-area.jse-selected {
  outline-color: var(--jse-context-menu-pointer-background, var(--jse-context-menu-background, #656565));
}
.jse-json-node .jse-insert-area.jse-selected :global(.jse-context-menu-pointer) {
  background: var(--jse-context-menu-pointer-background, var(--jse-context-menu-background, #656565));
}
.jse-json-node .jse-insert-area.jse-selected :global(.jse-context-menu-pointer):hover {
  background: var(--jse-context-menu-pointer-background-highlight, var(--jse-context-menu-background-highlight, #7a7a7a));
}

:global(.jse-main:not(.jse-focus)) .jse-json-node {
  --jse-selection-background-color: var(--jse-selection-background-inactive-color, #e8e8e8);
  --jse-context-menu-pointer-background: var(--jse-context-menu-pointer-hover-background, #b2b2b2);
}

.jse-expand {
  width: var(--jse-indent-size, calc(1em + 4px));
  padding: 0;
  margin: 0;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--jse-delimiter-color, rgba(0, 0, 0, 0.38));
  font-size: var(--jse-font-size-mono, 14px);
  height: var(--jse-line-height, calc(1em + 4px));
}
.jse-expand:hover {
  opacity: 0.8;
}

.jse-meta,
.jse-separator,
.jse-index,
.jse-bracket {
  vertical-align: top;
  color: var(--jse-delimiter-color, rgba(0, 0, 0, 0.38));
}

.jse-index {
  padding: 0 calc(0.5 * var(--jse-padding, 10px));
}

.jse-bracket {
  padding: 0 2px;
}
.jse-bracket.jse-expanded {
  padding-right: var(--jse-padding, 10px);
}

.jse-tag {
  border: none;
  font-size: 80%;
  font-family: var(--jse-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif);
  color: var(--jse-tag-color, var(--jse-text-color-inverse, #fff));
  background: var(--jse-tag-background, rgba(0, 0, 0, 0.2));
  border-radius: 2px;
  cursor: pointer;
  display: inline-block;
  padding: 0 4px;
  line-height: normal;
  margin: 1px 0;
}
.jse-tag:hover {
  opacity: 0.8;
}
.jse-tag.jse-expanded {
  opacity: 0.7;
  cursor: inherit;
}

.jse-identifier {
  vertical-align: top;
  position: relative;
}</style>
