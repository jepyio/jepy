/**
 * @enum {String}
 */
const Prefix = {
    ESCAPED: '$',
    RAW: '%',
};

/**
 * @enum {String}
 */
const BlockPrefix = {
    REPEATING: '#',
    CONDITIONAL: '?',
    TAB_INDENTED: '>',
    SPACE_INDENTED: '_',
    CACHED: '=',
};

export {Prefix, BlockPrefix};
