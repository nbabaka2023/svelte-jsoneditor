import { SvelteComponent } from "svelte";
import type { JSONPath } from 'immutable-json-patch';
import type { JSONParser, OnChangeMode } from '../../../types.js';
declare const __propDef: {
    props: {
        text: string | undefined;
        json: unknown | undefined;
        readOnly: boolean;
        parser: JSONParser;
        openJSONEditorModal: (path: JSONPath) => void;
        onChangeMode: OnChangeMode;
        onClick: () => void;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type TableModeWelcomeProps = typeof __propDef.props;
export type TableModeWelcomeEvents = typeof __propDef.events;
export type TableModeWelcomeSlots = typeof __propDef.slots;
export default class TableModeWelcome extends SvelteComponent<TableModeWelcomeProps, TableModeWelcomeEvents, TableModeWelcomeSlots> {
}
export {};
