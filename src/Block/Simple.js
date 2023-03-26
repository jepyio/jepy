import {Block} from '../Block.js';

/**
 * @implements {Block}
 */
class Simple extends Block {
    /**
     * @param {String} content
     */
    constructor(content) {
        super();
        /** @type {String} */
        this.content_ = content;
    }

    /**
     * @override
     * @public
     * @function
     * @return {String}
     */
    render() {
        return this.content_;
    }
}

export {Simple};
