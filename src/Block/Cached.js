import {Block} from '../Block.js';

/**
 * @implements {Block}
 */
class Cached extends Block {
    /** @type {Block} */
    #blockToCache;
    /**
     * @type {function}
     * @param {Object} params
     * @param {Cached} block
     */
    #validationCallback;
    /** @type {String} */
    #cachedValue = null;

    /**
     * @param {Block} blockToCache
     * @param {function} validationCallback
     */
    constructor(blockToCache, validationCallback) {
        super();
        this.#blockToCache = blockToCache;
        this.#validationCallback = validationCallback ? validationCallback : () => true;
    }

    /**
     * @override
     * @param {Object} params
     * @return {String}
     */
    render(params) {
        const isValid = this.#cachedValue !== null && this.#validationCallback(params, this);
        if (!isValid) {
            this.#cachedValue = this.#blockToCache.render(params);
        }
        return this.#cachedValue;
    }
}

export {Cached};
