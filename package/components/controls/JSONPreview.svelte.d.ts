import { SvelteComponent } from "svelte";
import type { JSONParser } from '../../types';
declare const __propDef: {
    props: {
        text: string | undefined;
        json: unknown | undefined;
        indentation: number | string;
        parser: JSONParser;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type JsonPreviewProps = typeof __propDef.props;
export type JsonPreviewEvents = typeof __propDef.events;
export type JsonPreviewSlots = typeof __propDef.slots;
export default class JsonPreview extends SvelteComponent<JsonPreviewProps, JsonPreviewEvents, JsonPreviewSlots> {
}
export {};
