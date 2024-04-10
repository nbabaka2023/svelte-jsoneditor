import { SvelteComponent } from "svelte";
import type { JSONSelection, OnRenderMenuInternal } from '../../../../types';
import type { HistoryState } from '../../../../logic/history.js';
declare const __propDef: {
    props: {
        json: unknown;
        selection: JSONSelection | null;
        readOnly: boolean;
        showSearch?: boolean | undefined;
        historyState: HistoryState;
        onExpandAll: () => void;
        onCollapseAll: () => void;
        onUndo: () => void;
        onRedo: () => void;
        onSort: () => void;
        onTransform: () => void;
        onContextMenu: (event: MouseEvent) => void;
        onCopy: () => void;
        onRenderMenu: OnRenderMenuInternal;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type TreeMenuProps = typeof __propDef.props;
export type TreeMenuEvents = typeof __propDef.events;
export type TreeMenuSlots = typeof __propDef.slots;
export default class TreeMenu extends SvelteComponent<TreeMenuProps, TreeMenuEvents, TreeMenuSlots> {
}
export {};
