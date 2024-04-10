import { SvelteComponent } from "svelte";
import type { QueryLanguageOptions } from '../../types.js';
declare const __propDef: {
    props: {
        json: unknown;
        queryOptions?: QueryLanguageOptions | undefined;
        onChange: (queryOptions: QueryLanguageOptions) => void;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type TransformWizardProps = typeof __propDef.props;
export type TransformWizardEvents = typeof __propDef.events;
export type TransformWizardSlots = typeof __propDef.slots;
export default class TransformWizard extends SvelteComponent<TransformWizardProps, TransformWizardEvents, TransformWizardSlots> {
}
export {};
