import { ValidationError } from "./errors.js";
export function integer(value) {
    const int = parseInt(value);
    if (int.toString() !== value) {
        throw new ValidationError('Value must be an integer');
    }
}
export function positive(value) {
    if (value < 0) {
        throw new ValidationError('Value must be a positive integer, or zero');
    }
}
export function maxValue(max) {
    return (value) => {
        if (value > max) {
            throw new ValidationError(`Value must be smaller than or equal to ${max}`);
        }
    };
}
export function validate(...funcs) {
    return (value) => {
        for (const fn of funcs) {
            fn(value);
        }
    };
}
export const validatePort = validate(integer, positive, maxValue(65_535));
//# sourceMappingURL=validation.js.map