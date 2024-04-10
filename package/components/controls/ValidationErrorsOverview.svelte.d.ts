import { SvelteComponent } from "svelte";
import { type ValidationError } from '../../types.js';
declare const __propDef: {
    props: {
        validationErrors: ValidationError[];
        selectError: (error: ValidationError) => void;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type ValidationErrorsOverviewProps = typeof __propDef.props;
export type ValidationErrorsOverviewEvents = typeof __propDef.events;
export type ValidationErrorsOverviewSlots = typeof __propDef.slots;
export default class ValidationErrorsOverview extends SvelteComponent<ValidationErrorsOverviewProps, ValidationErrorsOverviewEvents, ValidationErrorsOverviewSlots> {
}
export {};
