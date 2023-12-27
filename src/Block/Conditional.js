import {Block} from '../Block.js';

/**
 * @implements {Block}
 */
class Conditional extends Block {
    /**
     * @type {function}
     * @param {Object} params
     */
    #conditionCallback;
    /** @type {Block} */
    #blockOnTrue;
    /** @type {Block} */
    #blockOnFalse;

    /**
     * @param {function} conditionCallback
     * @param {Block} blockOnTrue
     * @param {Block} blockOnFalse
     */
    constructor(conditionCallback, blockOnTrue, blockOnFalse) {
        super();
        this.#conditionCallback = conditionCallback;
        this.#blockOnTrue = blockOnTrue;
        this.#blockOnFalse = blockOnFalse;
    }

    /**
     * @override
     * @param {Object} params
     * @return {String}
     */
    render(params) {
        const isTrue = this.#conditionCallback(params);
        if (isTrue) {
            return this.#blockOnTrue.render(params);
        }
        return this.#blockOnFalse ? this.#blockOnFalse.render(params) : '';
    }
}

export {Conditional};
