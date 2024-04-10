import type { ContextMenuItem, DocumentState, JSONParser } from '../../../..';
export default function ({ json, documentState, readOnly, parser, onEditValue, onEditRow, onToggleEnforceString, onCut, onCopy, onPaste, onRemove, onDuplicateRow, onInsertBeforeRow, onInsertAfterRow, onRemoveRow }: {
    json: unknown | undefined;
    documentState: DocumentState;
    readOnly: boolean;
    parser: JSONParser;
    onEditValue: () => void;
    onEditRow: () => void;
    onToggleEnforceString: () => void;
    onCut: (indent: boolean) => void;
    onCopy: (indent: boolean) => void;
    onPaste: () => void;
    onRemove: () => void;
    onDuplicateRow: () => void;
    onInsertBeforeRow: () => void;
    onInsertAfterRow: () => void;
    onRemoveRow: () => void;
}): ContextMenuItem[];
