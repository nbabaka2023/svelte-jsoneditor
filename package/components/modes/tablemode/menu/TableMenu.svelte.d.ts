import { SvelteComponent } from "svelte";
import type { OnRenderMenuInternal } from '../../../../types';
import type { HistoryState } from '../../../../logic/history';
declare const __propDef: {
    props: {
        containsValidArray: boolean;
        readOnly: boolean;
        showSearch?: boolean | undefined;
        historyState: HistoryState;
        onSort: () => void;
        onTransform: () => void;
        onContextMenu: (event: MouseEvent) => void;
        onUndo: () => void;
        onRedo: () => void;
        onRenderMenu: OnRenderMenuInternal;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type TableMenuProps = typeof __propDef.props;
export type TableMenuEvents = typeof __propDef.events;
export type TableMenuSlots = typeof __propDef.slots;
export default class TableMenu extends SvelteComponent<TableMenuProps, TableMenuEvents, TableMenuSlots> {
}
export {};
