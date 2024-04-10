import { compileJSONPointer, getIn, isJSONArray, isJSONObject } from 'immutable-json-patch';
import { forEachRight, groupBy, initial, isEqual, last } from 'lodash-es';
import { getEnforceString } from './documentState.js';
import { createSelectionFromOperations } from './selection.js';
import { rename } from './operations.js';
import { stringConvert } from '../utils/typeUtils.js';
import { SearchField } from '../types.js';
// TODO: comment
// TODO: unit test
export function updateSearchResult(json, newResultItems, previousResult) {
    const activePath = previousResult?.activeItem
        ? getSearchResultPath(previousResult.activeItem)
        : undefined;
    const matchingActiveIndex = newResultItems.findIndex((item) => {
        return isEqual(activePath, getSearchResultPath(item));
    });
    const activeIndex = matchingActiveIndex !== -1
        ? matchingActiveIndex
        : previousResult?.activeIndex !== undefined &&
            previousResult?.activeIndex < newResultItems.length
            ? previousResult?.activeIndex
            : newResultItems.length > 0
                ? 0
                : -1;
    const items = newResultItems.map((item, index) => {
        return { ...item, active: index === activeIndex };
    });
    const activeItem = items[activeIndex];
    return {
        items,
        itemsMap: groupBy(items, (item) => compileJSONPointer(item.path)),
        activeItem,
        activeIndex
    };
}
// TODO: unit test
export function searchNext(searchResult) {
    const nextActiveIndex = searchResult.activeIndex < searchResult.items.length - 1
        ? searchResult.activeIndex + 1
        : searchResult.items.length > 0
            ? 0
            : -1;
    const nextActiveItem = searchResult.items[nextActiveIndex];
    const items = searchResult.items.map((item, index) => {
        return { ...item, active: index === nextActiveIndex };
    });
    return {
        ...searchResult,
        items,
        itemsMap: groupBy(items, (item) => compileJSONPointer(item.path)),
        activeItem: nextActiveItem,
        activeIndex: nextActiveIndex
    };
}
// TODO: unit test
export function searchPrevious(searchResult) {
    const previousActiveIndex = searchResult.activeIndex > 0 ? searchResult.activeIndex - 1 : searchResult.items.length - 1;
    const previousActiveItem = searchResult.items[previousActiveIndex];
    const items = searchResult.items.map((item, index) => {
        return { ...item, active: index === previousActiveIndex };
    });
    return {
        ...searchResult,
        items,
        itemsMap: groupBy(items, (item) => compileJSONPointer(item.path)),
        activeItem: previousActiveItem,
        activeIndex: previousActiveIndex
    };
}
// TODO: comment
export function search(searchText, json, options = {}) {
    const searchTextLowerCase = searchText.toLowerCase();
    const maxResults = options?.maxResults ?? Infinity;
    const columns = options?.columns;
    const results = [];
    const path = []; // we reuse the same Array recursively, this is *much* faster than creating a new path every time
    function onMatch(match) {
        if (results.length >= maxResults) {
            return;
        }
        results.push(match);
    }
    function searchRecursive(searchTextLowerCase, value) {
        if (isJSONArray(value)) {
            const level = path.length;
            path.push('0');
            for (let i = 0; i < value.length; i++) {
                path[level] = String(i);
                searchRecursive(searchTextLowerCase, value[i]);
                if (results.length >= maxResults) {
                    return;
                }
            }
            path.pop();
        }
        else if (isJSONObject(value)) {
            const keys = Object.keys(value);
            const level = path.length;
            path.push('');
            for (const key of keys) {
                path[level] = key;
                findCaseInsensitiveMatches(key, searchTextLowerCase, path, SearchField.key, onMatch);
                searchRecursive(searchTextLowerCase, value[key]);
                if (results.length >= maxResults) {
                    return;
                }
            }
            path.pop();
        }
        else {
            // type is a value
            findCaseInsensitiveMatches(String(value), searchTextLowerCase, path, SearchField.value, onMatch);
        }
    }
    if (searchText === '') {
        return [];
    }
    else if (columns) {
        if (!Array.isArray(json)) {
            throw new Error('json must be an Array when option columns is defined');
        }
        for (let i = 0; i < json.length; i++) {
            path[0] = String(i);
            const item = json[i];
            for (let c = 0; c < columns.length; c++) {
                const column = columns[c];
                if (column.length === 1) {
                    path[1] = column[0];
                }
                else {
                    for (let p = 0; p < column.length; p++) {
                        path[p + 1] = column[p];
                    }
                }
                while (path.length > column.length + 1) {
                    path.pop();
                }
                const value = getIn(item, column);
                searchRecursive(searchTextLowerCase, value);
            }
            if (results.length >= maxResults) {
                break;
            }
        }
        return results;
    }
    else {
        searchRecursive(searchTextLowerCase, json);
        return results;
    }
}
/**
 * Do a case-insensitive search for a search text in a text
 */
export function findCaseInsensitiveMatches(text, searchTextLowerCase, path, field, onMatch) {
    const textLower = text.toLowerCase();
    let fieldIndex = 0;
    let position = -1;
    let index = -1;
    do {
        index = textLower.indexOf(searchTextLowerCase, position);
        if (index !== -1) {
            position = index + searchTextLowerCase.length;
            onMatch({
                path: path.slice(0), // path may be mutated in a later stage, therefore we store a copy
                field,
                fieldIndex,
                start: index,
                end: position
            });
            fieldIndex++;
        }
    } while (index !== -1);
}
/**
 * Replace a search result item with a replacement text
 */
export function replaceText(text, replacementText, start, end) {
    return text.substring(0, start) + replacementText + text.substring(end);
}
/**
 * Replace all matches with a replacement text
 */
export function replaceAllText(text, replacementText, occurrences) {
    let updatedText = text;
    forEachRight(occurrences, (occurrence) => {
        updatedText = replaceText(updatedText, replacementText, occurrence.start, occurrence.end);
    });
    return updatedText;
}
export function createSearchAndReplaceOperations(json, documentState, replacementText, searchResultItem, parser) {
    const { field, path, start, end } = searchResultItem;
    if (field === SearchField.key) {
        // replace a key
        const parentPath = initial(path);
        const parent = getIn(json, parentPath);
        const oldKey = last(path);
        const keys = Object.keys(parent);
        const newKey = replaceText(oldKey, replacementText, start, end);
        const operations = rename(parentPath, keys, oldKey, newKey);
        const newSelection = createSelectionFromOperations(json, operations);
        return {
            newSelection,
            operations
        };
    }
    else if (field === SearchField.value) {
        // replace a value
        const currentValue = getIn(json, path);
        if (currentValue === undefined) {
            throw new Error(`Cannot replace: path not found ${compileJSONPointer(path)}`);
        }
        const currentValueText = typeof currentValue === 'string' ? currentValue : String(currentValue);
        const pointer = compileJSONPointer(path);
        const enforceString = getEnforceString(currentValue, documentState.enforceStringMap, pointer, parser);
        const value = replaceText(currentValueText, replacementText, start, end);
        const operations = [
            {
                op: 'replace',
                path: compileJSONPointer(path),
                value: enforceString ? value : stringConvert(value, parser)
            }
        ];
        const newSelection = createSelectionFromOperations(json, operations);
        return {
            newSelection,
            operations
        };
    }
    else {
        throw new Error(`Cannot replace: unknown type of search result field ${field}`);
    }
}
export function createSearchAndReplaceAllOperations(json, documentState, searchText, replacementText, parser) {
    // TODO: to improve performance, we could reuse existing search results (except when hitting a maxResult limit)
    const searchResultItems = search(searchText, json, { maxResults: Infinity });
    // step 1: deduplicate matches inside the same field/value
    // (filter, map, and group)
    const deduplicatedMatches = [];
    for (let i = 0; i < searchResultItems.length; i++) {
        const previousItem = searchResultItems[i - 1];
        const item = searchResultItems[i];
        if (i === 0 || item.field !== previousItem.field || !isEqual(item.path, previousItem.path)) {
            deduplicatedMatches.push({
                path: item.path,
                field: item.field,
                items: [item]
            });
        }
        else {
            ;
            last(deduplicatedMatches).items.push(item);
        }
    }
    // step 2: sort from deepest nested to least nested
    // this is needed to replace in that order because paths may change
    // if there are replacements in keys
    deduplicatedMatches.sort((a, b) => {
        // sort values first, properties next
        if (a.field !== b.field) {
            if (a.field === SearchField.key) {
                return 1;
            }
            else {
                return -1;
            }
        }
        // sort longest paths first, shortest last
        return b.path.length - a.path.length;
    });
    // step 3: call createSearchAndReplaceOperations for each of the matches
    let allOperations = [];
    let lastNewSelection = null;
    deduplicatedMatches.forEach((match) => {
        // TODO: there is overlap with the logic of createSearchAndReplaceOperations. Can we extract and reuse this logic?
        const { field, path, items } = match;
        if (field === SearchField.key) {
            // replace a key
            const parentPath = initial(path);
            const parent = getIn(json, parentPath);
            const oldKey = last(path);
            const keys = Object.keys(parent);
            const newKey = replaceAllText(oldKey, replacementText, items);
            const operations = rename(parentPath, keys, oldKey, newKey);
            allOperations = allOperations.concat(operations);
            lastNewSelection = createSelectionFromOperations(json, operations);
        }
        else if (field === SearchField.value) {
            // replace a value
            const currentValue = getIn(json, path);
            if (currentValue === undefined) {
                throw new Error(`Cannot replace: path not found ${compileJSONPointer(path)}`);
            }
            const currentValueText = typeof currentValue === 'string' ? currentValue : String(currentValue);
            const pointer = compileJSONPointer(path);
            const enforceString = getEnforceString(currentValue, documentState.enforceStringMap, pointer, parser);
            const value = replaceAllText(currentValueText, replacementText, items);
            const operations = [
                {
                    op: 'replace',
                    path: compileJSONPointer(path),
                    value: enforceString ? value : stringConvert(value, parser)
                }
            ];
            allOperations = allOperations.concat(operations);
            lastNewSelection = createSelectionFromOperations(json, operations);
        }
        else {
            throw new Error(`Cannot replace: unknown type of search result field ${field}`);
        }
    });
    return {
        operations: allOperations,
        newSelection: lastNewSelection
    };
}
/**
 * Split the text into separate parts for each search result and the text
 * in between.
 */
export function splitValue(text, matches) {
    const parts = [];
    let previousEnd = 0;
    for (const match of matches) {
        const precedingText = text.slice(previousEnd, match.start);
        if (precedingText !== '') {
            parts.push({
                type: 'normal',
                text: precedingText,
                active: false
            });
        }
        const matchingText = text.slice(match.start, match.end);
        parts.push({
            type: 'highlight',
            text: matchingText,
            active: match.active
        });
        previousEnd = match.end;
    }
    const lastMatch = last(matches);
    if (lastMatch && lastMatch.end < text.length) {
        parts.push({
            type: 'normal',
            text: text.slice(lastMatch.end),
            active: false
        });
    }
    return parts;
}
/**
 * Get the path of the search result property on a nested search result
 */
function getSearchResultPath(searchResultItem) {
    return searchResultItem.path.concat(searchResultItem.field, String(searchResultItem.fieldIndex));
}
// TODO: write unit tests
export function filterKeySearchResults(map, pointer) {
    const items = map?.[pointer]?.filter((item) => item.field === SearchField.key);
    if (!items || items.length === 0) {
        return undefined;
    }
    return items;
}
// TODO: write unit tests
export function filterValueSearchResults(map, pointer) {
    const items = map?.[pointer]?.filter((item) => item.field === SearchField.value);
    if (!items || items.length === 0) {
        return undefined;
    }
    return items;
}
