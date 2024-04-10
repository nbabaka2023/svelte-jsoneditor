import type { JSONSchema, JSONSchemaDefinitions, RenderValueComponentDescription, RenderValueProps } from '../../types';
/**
 * Search the JSON schema for enums defined at given props.path. If found,
 * return an EnumValue renderer. If not found, return null. In that case you
 * have to fallback on the default valueRender function
 */
export declare function renderJSONSchemaEnum(props: RenderValueProps, schema: JSONSchema, schemaDefinitions?: JSONSchemaDefinitions): RenderValueComponentDescription[] | null;
