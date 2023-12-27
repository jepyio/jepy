import {Block} from '../Block.js';

/**
 * @implements {Block}
 */
class Composite extends Block {
    /** @type {Array<Block>} */
    #blocks;

    /**
     * @param {Array<Block>} blocks
     */
    constructor(blocks) {
        super();
        this.#blocks = blocks;
    }

    /**
     * @override
     * @param {Object} params
     * @return {String}
     */
    render(params) {
        return this.#blocks.map((block) => block.render(params)).join('');
    }
}

export {Composite};
