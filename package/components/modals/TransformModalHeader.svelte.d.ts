import { SvelteComponent } from "svelte";
import type { OnChangeQueryLanguage, QueryLanguage } from '../../types.js';
declare const __propDef: {
    props: {
        queryLanguages: QueryLanguage[];
        queryLanguageId: string;
        onChangeQueryLanguage: OnChangeQueryLanguage;
        fullscreen: boolean;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type TransformModalHeaderProps = typeof __propDef.props;
export type TransformModalHeaderEvents = typeof __propDef.events;
export type TransformModalHeaderSlots = typeof __propDef.slots;
export default class TransformModalHeader extends SvelteComponent<TransformModalHeaderProps, TransformModalHeaderEvents, TransformModalHeaderSlots> {
}
export {};
