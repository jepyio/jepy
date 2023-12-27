import {Block} from '../Block.js';

/**
 * @implements {Block}
 */
class Simple extends Block {
    /** @type {String} */
    #content;

    /**
     * @param {String} content
     */
    constructor(content) {
        super();
        this.#content = content;
    }

    /**
     * @override
     * @return {String}
     */
    render() {
        return this.#content;
    }
}

export {Simple};
