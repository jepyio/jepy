import {Block} from '../Block.js';

/**
 * @implements {Block}
 */
class Callback extends Block {
    /**
     * @type {function}
     * @param {Object} params
     */
    #renderCallback;

    /**
     * @param {function} renderCallback
     */
    constructor(renderCallback) {
        super();
        this.#renderCallback = renderCallback;
    }

    /**
     * @override
     * @param {Object} params
     * @return {String}
     */
    render(params) {
        return this.#renderCallback(params);
    }
}

export {Callback};
