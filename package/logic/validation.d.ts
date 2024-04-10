import type { ContentErrors, JSONParser, JSONPointerMap, NestedValidationError, ValidationError, Validator } from '../types.js';
/**
 * Create a flat map with validation errors, where the key is the stringified path
 * and also create error messages for the parent nodes of the nodes having an error.
 *
 * Returns a nested object containing the validation errors
 */
export declare function mapValidationErrors(validationErrors: ValidationError[]): JSONPointerMap<NestedValidationError>;
export declare function validateJSON(json: unknown, validator: Validator | null, parser: JSONParser, validationParser: JSONParser): ValidationError[];
export declare function validateText(text: string, validator: Validator | null, parser: JSONParser, validationParser: JSONParser): ContentErrors | null;
