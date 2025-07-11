import {Block} from '../Block.js';

/**
 * @enum {String}
 */
const IndentType = {
    SPACE: ' ',
    TAB: '\t',
};

/**
 * @implements {Block}
 */
class Indented extends Block {
    /** @type {Block} */
    #block;
    /** @type {IndentType} */
    #indentType;
    /** @type {Number} */
    #indentLevel;

    /**
     * @param {Block} block
     * @param {IndentType} indentType
     * @param {Number} indentLevel
     */
    constructor(block, indentType, indentLevel) {
        super();
        this.#block = block;
        this.#indentType = indentType;
        this.#indentLevel = indentLevel;
    }

    /**
     * @override
     * @param {Object} params
     * @return {String}
     */
    render(params) {
        const indent = String().padStart(this.#indentLevel, this.#indentType);
        const content = this.#block.render(params);
        return content.replace(new RegExp('^', 'gm'), indent);
    }
}

export {Indented, IndentType};
