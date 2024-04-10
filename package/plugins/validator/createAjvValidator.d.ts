import type Ajv from 'ajv';
import type { Options } from 'ajv';
import type { JSONSchema, JSONSchemaDefinitions, Validator } from '../../types';
export interface AjvValidatorOptions {
    schema: JSONSchema;
    schemaDefinitions?: JSONSchemaDefinitions;
    ajvOptions?: Options;
    onCreateAjv?: (ajv: Ajv) => Ajv | void;
}
/**
 * Create a JSON Schema validator powered by Ajv.
 * @param options
 * @property schema
 *                    The JSON schema to validate (required).
 * @property [schemaDefinitions=undefined]
 *                    An object containing JSON Schema definitions
 *                    which can be referenced using $ref
 * @property [ajvOptions=undefined]
 *                    Optional extra options for Ajv
 * @property [onCreateAjv=undefined]
 *                    An optional callback function allowing to apply additional
 *                    configuration on the provided Ajv instance, or return
 *                    your own Ajv instance and ignore the provided one.
 * @return Returns a validation function
 */
export declare function createAjvValidator(options: AjvValidatorOptions): Validator;
