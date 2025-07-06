/**
 * @enum {String}
 */
const GenericFilter = {
    STRINGIFY: 'stringify',
};
/**
 * @enum {String}
 */
const StringFilter = {
    UPPER: 'upper',
    LOWER: 'lower',
    CAPITALIZE: 'capitalize',
    TRIM: 'trim',
};
/**
 * @enum {String}
 */
const NumberFilter = {
    ABS: 'abs',
    ROUND: 'round',
    FLOOR: 'floor',
    CEIL: 'ceil',
};
/**
 * @enum {String}
 */
const ArrayFilter = {
    FIRST: 'first',
    LAST: 'last',
    MIN: 'min',
    MAX: 'max',
};

export {GenericFilter, StringFilter, NumberFilter, ArrayFilter};
