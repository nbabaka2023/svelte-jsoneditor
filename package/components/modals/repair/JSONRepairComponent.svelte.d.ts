import { SvelteComponent } from "svelte";
declare const __propDef: {
    props: {
        text?: string | undefined;
        readOnly?: boolean | undefined;
        onParse: (text: string) => void;
        onRepair: (text: string) => string;
        onChange?: ((updatedText: string) => void) | null | undefined;
        onApply: (repairedText: string) => void;
        onCancel: () => void;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type JsonRepairComponentProps = typeof __propDef.props;
export type JsonRepairComponentEvents = typeof __propDef.events;
export type JsonRepairComponentSlots = typeof __propDef.slots;
export default class JsonRepairComponent extends SvelteComponent<JsonRepairComponentProps, JsonRepairComponentEvents, JsonRepairComponentSlots> {
}
export {};
