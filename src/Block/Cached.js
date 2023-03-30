import {Block} from '../Block.js';

/**
 * @implements {Block}
 */
class Cached extends Block {
    /**
     * @param {Block} blockToCache
     * @param {function} validationCallback
     */
    constructor(blockToCache, validationCallback) {
        super();
        /** @type {Block} */
        this.blockToCache_ = blockToCache;
        /**
         * @type {function}
         * @param {Object} params
         * @param {Cached} block
         */
        this.validationCallback_ = validationCallback
            ? validationCallback
            : () => true;
        /** @type {String} */
        this.cachedValue_ = null;
    }

    /**
     * @override
     * @public
     * @function
     * @param {Object} params
     * @return {String}
     */
    render(params) {
        const isValid = this.cachedValue_ !== null
            && this.validationCallback_(params, this);
        if (!isValid) {
            this.cachedValue_ = this.blockToCache_.render(params);
        }
        return this.cachedValue_;
    }
}

export {Cached};
