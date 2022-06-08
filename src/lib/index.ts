import JSONEditor from './components/JSONEditor.svelte'
import SortModal from './components/modals/SortModal.svelte'
import TransformModal from './components/modals/TransformModal.svelte'
import BooleanToggle from './plugins/value/components/BooleanToggle.svelte'
import ColorPicker from './plugins/value/components/ColorPicker.svelte'
import EditableValue from './plugins/value/components/EditableValue.svelte'
import EnumValue from './plugins/value/components/EnumValue.svelte'
import ReadonlyValue from './plugins/value/components/ReadonlyValue.svelte'
import TimestampTag from './plugins/value/components/TimestampTag.svelte'

// editor
export { JSONEditor }
export * from './types'

// value plugins
export { renderValue } from './plugins/value/renderValue.js'
export { renderJSONSchemaEnum } from './plugins/value/renderJSONSchemaEnum.js'
export { BooleanToggle, ColorPicker, EditableValue, EnumValue, ReadonlyValue, TimestampTag }

// validator plugins
export { createAjvValidator } from './plugins/validator/createAjvValidator.js'

// query plugins
export { lodashQueryLanguage } from './plugins/query/lodashQueryLanguage.js'
export { javascriptQueryLanguage } from './plugins/query/javascriptQueryLanguage.js'
export { jmespathQueryLanguage } from './plugins/query/jmespathQueryLanguage.js'

// utils
export { SortModal, TransformModal }
export { getJSONSchemaOptions, findSchema, findEnum } from './utils/jsonSchemaUtils.js'
export { parseJSONPointerWithArrayIndices } from './utils/jsonPointer.js'
export { isTextContent, isLargeContent, estimateSerializedSize } from './utils/jsonUtils.js'
export {
  parseJSONPointer,
  compileJSONPointer,
  getIn,
  setIn,
  updateIn,
  insertAt,
  existsIn,
  deleteIn
} from 'immutable-json-patch'
export { immutableJSONPatch, revertJSONPatch } from 'immutable-json-patch'