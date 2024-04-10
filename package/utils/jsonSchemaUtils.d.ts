import type { JSONPath } from 'immutable-json-patch';
import type { JSONSchema, JSONSchemaDefinitions, JSONSchemaEnum } from '../types';
/**
 * Find enum options for given path in a JSONSchema
 */
export declare function getJSONSchemaOptions(schema: JSONSchema, schemaDefinitions: JSONSchemaDefinitions | undefined, path: JSONPath): JSONSchemaEnum | null;
/**
 * find an enum definition in a JSON schema, as property `enum` or inside
 * one of the schemas composites (`oneOf`, `anyOf`, `allOf`)
 *
 * Source: https://github.com/josdejong/jsoneditor/blob/develop/src/js/Node.js
 */
export declare function findEnum(schema: JSONSchema): JSONSchemaEnum | null;
/**
 * Return the part of a JSON schema matching given path.
 *
 * Source: https://github.com/josdejong/jsoneditor/blob/develop/src/js/Node.js
 */
export declare function findSchema(topLevelSchema: JSONSchema, schemaDefinitions: JSONSchemaDefinitions, path: JSONPath, currentSchema?: JSONSchema): JSONSchema | null;
