import type { ConvertType, DocumentState, InsertType, JSONParser } from '../../../../types';
import type { ContextMenuItem } from '../../../..';
export default function ({ json, documentState, readOnly, parser, onEditKey, onEditValue, onToggleEnforceString, onCut, onCopy, onPaste, onRemove, onDuplicate, onExtract, onInsertBefore, onInsert, onConvert, onInsertAfter, onSort, onTransform }: {
    json: unknown;
    documentState: DocumentState;
    readOnly: boolean;
    parser: JSONParser;
    onEditKey: () => void;
    onEditValue: () => void;
    onToggleEnforceString: () => void;
    onCut: (indent: boolean) => void;
    onCopy: (indent: boolean) => void;
    onPaste: () => void;
    onRemove: () => void;
    onDuplicate: () => void;
    onExtract: () => void;
    onInsertBefore: () => void;
    onInsert: (type: InsertType) => void;
    onConvert: (type: ConvertType) => void;
    onInsertAfter: () => void;
    onSort: () => void;
    onTransform: () => void;
}): ContextMenuItem[];