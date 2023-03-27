import {Block} from '../Block.js';

/**
 * @implements {Block}
 */
class Callback extends Block {
    /**
     * @param {function} renderCallback
     */
    constructor(renderCallback) {
        super();
        /**
         * @type {function}
         * @param {Object} params
         */
        this.renderCallback_ = renderCallback;
    }

    /**
     * @override
     * @public
     * @function
     * @param {Object} params
     * @return {String}
     */
    render(params) {
        return this.renderCallback_(params);
    }
}

export {Callback};
