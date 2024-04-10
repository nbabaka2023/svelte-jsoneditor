import { SvelteComponent } from "svelte";
import type { NestedValidationError, ValidationError } from '../../../types.js';
declare const __propDef: {
    props: {
        validationError: NestedValidationError | ValidationError;
        onExpand: (event: MouseEvent) => void;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type ValidationErrorIconProps = typeof __propDef.props;
export type ValidationErrorIconEvents = typeof __propDef.events;
export type ValidationErrorIconSlots = typeof __propDef.slots;
export default class ValidationErrorIcon extends SvelteComponent<ValidationErrorIconProps, ValidationErrorIconEvents, ValidationErrorIconSlots> {
}
export {};
