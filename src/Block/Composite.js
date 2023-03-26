import {Block} from '../Block.js';

/**
 * @implements {Block}
 */
class Composite extends Block {
    /**
     * @param {Array<Block>} blocks
     */
    constructor(blocks) {
        super();
        /** @type {Array<Block>} */
        this.blocks_ = blocks;
    }

    /**
     * @override
     * @public
     * @function
     * @param {Object} params
     * @return {String}
     */
    render(params) {
        return this.blocks_.map((block) => block.render(params)).join('');
    }
}

export {Composite};
