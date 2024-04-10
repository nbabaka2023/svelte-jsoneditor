import { isUrl, valueType } from '../../../../utils/typeUtils.js';
import { classnames } from '../../../../utils/cssUtils.js';
export function getValueClass(value, parser) {
    const type = valueType(value, parser);
    return classnames('jse-value', 'jse-' + type, {
        'jse-url': isUrl(value),
        'jse-empty': typeof value === 'string' && value.length === 0
    });
}
