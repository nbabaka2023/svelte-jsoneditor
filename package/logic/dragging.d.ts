import type { JSONPatchDocument } from 'immutable-json-patch';
import type { DocumentState, JSONSelection, RenderedItem } from '../types';
export interface MoveSelectionProps {
    json: unknown;
    documentState: DocumentState;
    deltaY: number;
    items: RenderedItem[];
}
export interface MoveSelectionResult {
    operations: JSONPatchDocument | undefined;
    updatedSelection: JSONSelection | null;
    offset: number;
}
export declare function onMoveSelection({ json, documentState, deltaY, items }: MoveSelectionProps): MoveSelectionResult;
