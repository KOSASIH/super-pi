import { RecordType } from '../index.js';
export function getTypes(types) {
    const DEFAULT_TYPES = [
        RecordType.A
    ];
    if (types == null) {
        return DEFAULT_TYPES;
    }
    if (Array.isArray(types)) {
        if (types.length === 0) {
            return DEFAULT_TYPES;
        }
        return types;
    }
    return [
        types
    ];
}
//# sourceMappingURL=get-types.js.map