import {Block} from '../Block.js';

/**
 * @enum {String}
 */
const IndentType = {
    SPACE: ' ',
    TAB: '\t'
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
        const content = this.#block.render(params);
        const lines = content.split('\n');
        if (lines.length > 1) {
            return lines.map((line) => this.#pad(line)).join('\n');
        }
        return this.#pad(content);
    }

    /**
     * @param {String} content
     * @return {String}
     */
    #pad(content) {
        return content.padStart(this.#indentLevel + content.length, this.#indentType);
    }
}

export {Indented, IndentType};
