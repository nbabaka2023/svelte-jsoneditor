import { startsWithJSONPointer } from 'immutable-json-patch';
// TODO: write unit tests
export function filterMapOrUndefined(map, filter) {
    if (!map) {
        return undefined;
    }
    const filteredMap = {};
    for (const p of Object.keys(map)) {
        if (filter(p, map[p])) {
            filteredMap[p] = map[p];
        }
    }
    return Object.keys(filteredMap).length > 0 ? filteredMap : undefined;
}
// TODO: write unit tests
export function filterPointerOrUndefined(map, pointer) {
    return filterMapOrUndefined(map, (p) => startsWithJSONPointer(p, pointer));
}
