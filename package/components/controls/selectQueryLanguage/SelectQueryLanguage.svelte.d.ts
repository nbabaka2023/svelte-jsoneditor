import { SvelteComponent } from "svelte";
import type { QueryLanguage, OnChangeQueryLanguage } from '../../../types.js';
declare const __propDef: {
    props: {
        queryLanguages: QueryLanguage[];
        queryLanguageId: string;
        onChangeQueryLanguage: OnChangeQueryLanguage;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type SelectQueryLanguageProps = typeof __propDef.props;
export type SelectQueryLanguageEvents = typeof __propDef.events;
export type SelectQueryLanguageSlots = typeof __propDef.slots;
export default class SelectQueryLanguage extends SvelteComponent<SelectQueryLanguageProps, SelectQueryLanguageEvents, SelectQueryLanguageSlots> {
}
export {};
