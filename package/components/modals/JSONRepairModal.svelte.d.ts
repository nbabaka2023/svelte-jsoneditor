import { SvelteComponent } from "svelte";
declare const __propDef: {
    props: {
        text: string;
        onParse: (text: string) => void;
        onRepair: (text: string) => string;
        onApply: (repairedText: string) => void;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type JsonRepairModalProps = typeof __propDef.props;
export type JsonRepairModalEvents = typeof __propDef.events;
export type JsonRepairModalSlots = typeof __propDef.slots;
export default class JsonRepairModal extends SvelteComponent<JsonRepairModalProps, JsonRepairModalEvents, JsonRepairModalSlots> {
}
export {};
